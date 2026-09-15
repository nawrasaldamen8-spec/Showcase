---
name: application-layer
description: >-
  Use this skill when creating features (commands, queries, handlers, validators), working with DTOs/response records, pagination, or any code in the Architecture.Application project. Guides CQRS structure, record conventions, and IApplicationDbContext usage.
---

# Application Layer

## 1. Layer Role
- **Application** = use cases / features, orchestrates domain logic
- **Project**: `Architecture.Application`
- **Depends on**: `Architecture.Domain`
- **Uses**: MediatR (14.2.0), FluentValidation (12.1.1), Microsoft.EntityFrameworkCore (abstractions only)

## 2. File Structure

```text
Architecture.Application/
├── Common/
│   ├── Behaviors/
│   │   ├── LoggingBehavior.cs          → Logs request name + execution time (ms)
│   │   └── ValidationBehavior.cs       → Runs FluentValidation, returns Result.Failure on errors
│   ├── DependencyInjection/
│   │   └── DependencyInjection.cs      → AddApplication() extension method
│   ├── Interfaces/
│   │   └── IApplicationDbContext.cs    → DbContext abstraction
│   └── Models/
│       └── PaginatedList.cs            → Generic paginated result
└── Features/
    └── {FeatureName}/
        ├── Commands/
        │   └── {Action}/
        │       ├── {Action}Command.cs         (record : IRequest<Result> or IRequest<Result<T>>)
        │       ├── {Action}CommandHandler.cs   (IRequestHandler<TRequest, TResponse>)
        │       └── {Action}CommandValidator.cs (AbstractValidator<{Action}Command>)
        └── Queries/
            └── {Action}/
                ├── {Action}Query.cs            (record : IRequest<Result<T>>)
                ├── {Action}QueryHandler.cs     (IRequestHandler<TRequest, TResponse>)
                └── {Action}Response.cs          (record — the DTO)
```

## 3. Feature Naming Convention
- **Feature folder** = entity name plural or feature area: `Products`, `Orders`, `Auth`
- **Action folder** = verb: `CreateProduct`, `GetProduct`, `GetProducts`, `UpdateProduct`, `DeleteProduct`

## 4. Command Pattern

```csharp
using Architecture.Domain.Common.Results;
using MediatR;

namespace Architecture.Application.Features.Products.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price) : IRequest<Result<Guid>>;
```

**Rules:**
- Commands that create → return `Result<Guid>` (the new entity ID)
- Commands that update/delete → return `Result` (success/failure only)
- Use `record` not `class`
- Parameters in constructor (positional record)

## 5. Command Handler Pattern

```csharp
using Architecture.Application.Common.Interfaces;
using Architecture.Domain.Common.Results;
using Architecture.Domain.Entities;
using MediatR;

namespace Architecture.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;

    public CreateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product(request.Name, request.Description, request.Price);

        _context.Set<Product>().Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return product.Id;  // implicit conversion to Result<Guid>
    }
}
```

**Key points:**
- Inject `IApplicationDbContext` not `ApplicationDbContext`
- Use `_context.Set<Product>()` not a specific DbSet property
- Return values use implicit conversion (no need for `Result.Success(...)`)
- Return errors use implicit conversion: `return ProductErrors.NotFound(id);`

## 6. Validator Pattern

```csharp
using FluentValidation;

namespace Architecture.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.");
    }
}
```

**Rules:**
- Only create validators for Commands that need validation
- Validators are auto-discovered via `AddValidatorsFromAssembly`
- ValidationBehavior automatically runs them — no manual invocation
- On failure, returns `Result.Failure(Error.Validation(...))` — NOT exceptions

## 7. Query Pattern

```csharp
public record GetProductQuery(Guid Id) : IRequest<Result<ProductResponse>>;
```

## 8. Query Handler with Response Record

```csharp
public record ProductResponse(Guid Id, string Name, string Description, decimal Price);

public class GetProductQueryHandler : IRequestHandler<GetProductQuery, Result<ProductResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetProductQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ProductResponse>> Handle(GetProductQuery request, CancellationToken ct)
    {
        var product = await _context.Set<Product>()
            .Where(p => p.Id == request.Id)
            .Select(p => new ProductResponse(p.Id, p.Name, p.Description, p.Price))
            .FirstOrDefaultAsync(ct);

        if (product is null)
            return ProductErrors.NotFound(request.Id);

        return product;
    }
}
```

## 9. DTO/Response Records Convention (CRITICAL)
- ❌ Do **NOT** create a shared `DTOs/` folder
- ❌ Do **NOT** create a separate record per entity that's shared everywhere
- ✅ Response records live **INSIDE** the query folder that defines them
- ✅ One `{Entity}Response` per entity, reused across queries for the same entity
- ✅ Use `record` (immutable, positional)
- ✅ Project directly in the query (`.Select(p => new ProductResponse(...))`) — avoid loading full entities for queries
- Split into `ProductResponse` and `ProductSummaryResponse` ONLY if two queries need fundamentally different shapes

## 10. Pagination

`PaginatedList<T>` is at `Common/Models/PaginatedList.cs`:
- **Properties**: `Items`, `PageNumber`, `TotalPages`, `TotalCount`, `HasPreviousPage`, `HasNextPage`
- **Factory**: `PaginatedList<T>.Create(items, count, pageNumber, pageSize)`

**Query example:**
```csharp
public record GetProductsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<Result<PaginatedList<ProductResponse>>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<PaginatedList<ProductResponse>>>
{
    private readonly IApplicationDbContext _context;

    public async Task<Result<PaginatedList<ProductResponse>>> Handle(GetProductsQuery request, CancellationToken ct)
    {
        var query = _context.Set<Product>().AsNoTracking();

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductResponse(p.Id, p.Name, p.Description, p.Price))
            .ToListAsync(ct);

        return PaginatedList<ProductResponse>.Create(items, totalCount, request.PageNumber, request.PageSize);
    }
}
```

## 11. IApplicationDbContext

Interface at `Common/Interfaces/IApplicationDbContext.cs`:
```csharp
public interface IApplicationDbContext
{
    DbSet<TEntity> Set<TEntity>() where TEntity : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```
- Use `Set<T>()` generic method — do **NOT** add entity-specific DbSet properties to this interface
- Implementation lives in Infrastructure (`ApplicationDbContext`)

## 12. DI Registration

`AddApplication()` in `DependencyInjection.cs` auto-registers:
- All MediatR handlers via `RegisterServicesFromAssembly`
- LoggingBehavior and ValidationBehavior as open behaviors
- All FluentValidation validators via `AddValidatorsFromAssembly`

No manual registration needed for handlers or validators.

## 13. Error Handling — Step 2: Returning Errors
- Handlers return `Result<T>` or `Result` — NEVER throw exceptions for business logic
- Pattern: `return ProductErrors.NotFound(id);` — implicit conversion from `Error` to `Result<T>`
- On success: `return product;` or `return Result.Success()` — implicit conversion
- `ValidationBehavior` automatically catches FluentValidation failures and returns `Result.Failure(error)`

## 14. Feature Workflow — Step 3: Application Layer
After Domain (Step 1) and Infrastructure (Step 2):
1. Create the feature folder under `Features/{FeatureName}/`
2. Add Command/Query records
3. Add Handler (inject `IApplicationDbContext`, use `Set<Entity>()`)
4. Add Validator (if command needs validation)
5. Add Response record (if query returns data)
6. Next → go to api-layer skill (Step 4)

## 15. Rules (CRITICAL)
- ❌ **NEVER** inject concrete DbContext — always use `IApplicationDbContext`
- ❌ **NEVER** create a shared DTOs/ folder
- ❌ **NEVER** throw exceptions for business logic — use Result pattern
- ❌ **NEVER** add entity-specific DbSet properties to `IApplicationDbContext`
- ✅ **ALWAYS** use `context.Set<Entity>()` for data access
- ✅ **ALWAYS** project to response records in queries (`.Select()`)
- ✅ **ALWAYS** use `record` types for commands, queries, and responses
- ✅ **ALWAYS** follow the folder structure: `Features/{Name}/Commands/{Action}/` or `Queries/{Action}/`
