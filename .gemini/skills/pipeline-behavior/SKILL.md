---
name: pipeline-behavior
description: >-
  Use this skill when creating a new MediatR pipeline behavior (IPipelineBehavior). Guides the implementation pattern, registration, and ordering based on existing LoggingBehavior and ValidationBehavior examples.
---

# Creating MediatR Pipeline Behaviors

## 1. What is a Pipeline Behavior
- MediatR middleware that wraps every request/response
- Executes cross-cutting concerns (logging, validation, caching, transactions, authorization)
- Runs in registration order around the handler
- Flow: Request → Behavior1 → Behavior2 → ... → Handler → ... → Behavior2 → Behavior1 → Response

## 2. Existing Behaviors in This Project

**LoggingBehavior** (at `Architecture.Application/Common/Behaviors/LoggingBehavior.cs`):
- Logs request name when processing starts
- Uses Stopwatch to measure execution time
- Logs completion with elapsed milliseconds
- Registered first → wraps everything

**ValidationBehavior** (at `Architecture.Application/Common/Behaviors/ValidationBehavior.cs`):
- Collects all `IValidator<TRequest>` validators via DI
- Runs all validators in parallel (`Task.WhenAll`)
- If failures: returns `Result.Failure(Error.Validation(...))` for the first failure
- Supports both `Result` and `Result<T>` response types
- Falls back to throwing `ValidationException` for non-Result responses
- Registered second → validates before handler executes

**Current registration order:**
```csharp
cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));    // 1st: logs everything
cfg.AddOpenBehavior(typeof(ValidationBehavior<,>)); // 2nd: validates before handler
```

## 3. Creating a New Behavior — Step by Step

**Step 1:** Create the class at `Architecture.Application/Common/Behaviors/{Name}Behavior.cs`

**Step 2:** Implement `IPipelineBehavior<TRequest, TResponse>`

**Step 3:** Register in `DependencyInjection.cs` → `cfg.AddOpenBehavior(typeof({Name}Behavior<,>))`

**Step 4:** Choose the correct position in the registration order

## 4. Behavior Template

```csharp
using MediatR;

namespace Architecture.Application.Common.Behaviors;

public class {Name}Behavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    // Inject dependencies via constructor
    
    public {Name}Behavior(/* dependencies */)
    {
        // Store dependencies
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // === PRE-PROCESSING ===
        // Code here runs BEFORE the handler
        
        var response = await next();  // Execute the next behavior or handler
        
        // === POST-PROCESSING ===
        // Code here runs AFTER the handler
        
        return response;
    }
}
```

## 5. Common Behavior Examples

### Transaction Behavior (wraps handler in a DB transaction)
```csharp
using Architecture.Application.Common.Interfaces;
using MediatR;

namespace Architecture.Application.Common.Behaviors;

public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IApplicationDbContext _context;

    public TransactionBehavior(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Only wrap commands (not queries) in transactions
        // Convention: commands end with "Command"
        if (!typeof(TRequest).Name.EndsWith("Command"))
            return await next();

        using var transaction = await ((DbContext)_context)
            .Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var response = await next();
            await transaction.CommitAsync(cancellationToken);
            return response;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
```

### Performance Behavior (warns on slow requests)
```csharp
using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Architecture.Application.Common.Behaviors;

public class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<TRequest> _logger;
    private const int SlowRequestThresholdMs = 500;

    public PerformanceBehavior(ILogger<TRequest> logger) => _logger = logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        var response = await next();
        stopwatch.Stop();

        if (stopwatch.ElapsedMilliseconds > SlowRequestThresholdMs)
        {
            _logger.LogWarning(
                "Slow request detected: {RequestName} took {ElapsedMs} ms",
                typeof(TRequest).Name,
                stopwatch.ElapsedMilliseconds);
        }

        return response;
    }
}
```

### Authorization Behavior (checks user permissions before handler)
Note: Only create this if endpoint-level `.RequireAuthorization()` isn't sufficient.
```csharp
using Architecture.Application.Common.Interfaces;
using Architecture.Domain.Common.Results;
using MediatR;

namespace Architecture.Application.Common.Behaviors;

// Define a marker interface for requests that need authorization
public interface IAuthorizedRequest
{
    string RequiredRole { get; }
}

public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICurrentUserService _currentUserService;

    public AuthorizationBehavior(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is not IAuthorizedRequest authorizedRequest)
            return await next();

        if (_currentUserService.UserId is null)
        {
            // Return Unauthorized using Result pattern
            // (use reflection pattern from ValidationBehavior)
        }

        // Check role...
        return await next();
    }
}
```

## 6. Registration and Ordering

In `Architecture.Application/Common/DependencyInjection/DependencyInjection.cs`:
```csharp
services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(assembly);
    
    // Order matters! Behaviors execute in registration order.
    cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));       // 1st: Log all requests
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));    // 2nd: Validate input
    // cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>)); // 3rd: Check permissions
    // cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));   // 4th: Wrap in transaction
    // cfg.AddOpenBehavior(typeof(PerformanceBehavior<,>));   // 5th: Monitor performance
});
```

**Recommended order:**
1. Logging (always first — logs everything including failures)
2. Validation (reject invalid input before doing any work)
3. Authorization (reject unauthorized before doing any work)
4. Transaction (wrap the handler in a transaction)
5. Performance / Others (wrap closest to the handler)

## 7. When to Return Result vs Throw
- If your behavior needs to short-circuit with a domain error → return `Result.Failure(error)` (use the reflection pattern from ValidationBehavior)
- If your behavior encounters an infrastructure error → throw an exception (GlobalExceptionHandler catches it)
- Pattern for returning Result from a generic behavior:
```csharp
if (typeof(TResponse) == typeof(Result))
    return (TResponse)(object)Result.Failure(error);

if (typeof(TResponse).IsGenericType && typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
{
    var failureMethod = typeof(Result).GetMethods()
        .First(m => m.Name == nameof(Result.Failure) && m.IsGenericMethod)
        .MakeGenericMethod(typeof(TResponse).GetGenericArguments()[0]);
    return (TResponse)failureMethod.Invoke(null, [error])!;
}
```

## 8. Rules (CRITICAL)
- ❌ NEVER put feature-specific logic in a behavior — behaviors are cross-cutting
- ❌ NEVER forget to register the behavior in DependencyInjection.cs
- ❌ NEVER ignore the registration order — it determines execution order
- ✅ ALWAYS use the `where TRequest : notnull` constraint (matching existing behaviors)
- ✅ ALWAYS call `await next()` to continue the pipeline (unless short-circuiting)
- ✅ ALWAYS follow the naming convention: `{Name}Behavior<TRequest, TResponse>`
- ✅ ALWAYS place in `Architecture.Application/Common/Behaviors/`
- ✅ ALWAYS consider if endpoint-level middleware is sufficient before creating a pipeline behavior
