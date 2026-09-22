---
name: api-layer
description: >-
  Use this skill when creating API endpoints, designing routes, handling HTTP responses, or working with the Showcase.Api project. Guides IEndpoint implementation, ResultExtensions usage, and RESTful API design.
---

# API Layer Guide

This guide teaches how to work with the API layer in this project. The API layer acts as the HTTP entry point, mapping requests to MediatR commands/queries.

## 1. Layer Role

- **API**: HTTP entry point, maps requests to MediatR commands/queries
- **Project**: `Showcase.Api`
- **Depends on**: `Showcase.Application`, `Showcase.Infrastructure`
- **Uses**: Minimal APIs (NOT controllers), auto-discovery endpoint pattern

## 2. File Structure

```text
Showcase.Api/
├── Common/
│   ├── Errors/
│   │   └── GlobalExceptionHandler.cs    → Catches unhandled exceptions → 500 ProblemDetails
│   └── Results/
│       └── ResultExtensions.cs          → Maps Result<T> to HTTP responses
├── DependencyInjection/
│   └── DependencyInjection.cs           → AddApi() extension
├── Endpoints/
│   ├── IEndpoint.cs                     → Interface all endpoints implement
│   ├── EndpointExtensions.cs            → Auto-discovery & registration
│   └── {FeatureName}/
│       ├── Create{Entity}.cs            → POST endpoint
│       ├── Get{Entity}.cs               → GET by ID endpoint
│       ├── Get{Entities}.cs             → GET list/paginated endpoint
│       ├── Update{Entity}.cs            → PUT endpoint
│       └── Delete{Entity}.cs            → DELETE endpoint
├── Program.cs
├── appsettings.json
└── appsettings.Development.json
```

## 3. IEndpoint Interface

All endpoint classes implement the `IEndpoint` interface. They're auto-discovered via reflection in `EndpointExtensions.AddEndpoints()`.

```csharp
public interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder app);
}
```

## 4. Creating an Endpoint — Full Examples

### POST (Create)

```csharp
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Products.Commands.CreateProduct;
using MediatR;

namespace Showcase.Api.Endpoints.Products;

public class CreateProduct : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/products", async (
            CreateProductCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Products")
        .WithName(nameof(CreateProduct))
        .Produces<Guid>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest);
    }
}
```

### GET by ID

```csharp
namespace Showcase.Api.Endpoints.Products;

public class GetProduct : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/products/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetProductQuery(id), ct);
            return result.ToResponse();
        })
        .WithTags("Products")
        .WithName(nameof(GetProduct))
        .Produces<ProductResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound);
    }
}
```

### GET List (Paginated)

```csharp
namespace Showcase.Api.Endpoints.Products;

public class GetProducts : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/products", async (
            int pageNumber,
            int pageSize,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetProductsQuery(pageNumber, pageSize), ct);
            return result.ToResponse();
        })
        .WithTags("Products")
        .WithName(nameof(GetProducts))
        .Produces<PaginatedList<ProductResponse>>(StatusCodes.Status200OK);
    }
}
```

### PUT (Update)

```csharp
public class UpdateProduct : IEndpoint
{
    public record UpdateProductRequest(string Name, string Description, decimal Price);

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/products/{id:guid}", async (
            Guid id,
            UpdateProductRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateProductCommand(id, request.Name, request.Description, request.Price);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Products")
        .WithName(nameof(UpdateProduct));
    }
}
```

**Note:** When the route has an `{id}` AND a body, create a local `Request` record inside the endpoint to bind the body, then combine with route params to create the Command.

### DELETE

```csharp
public class DeleteProduct : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/products/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteProductCommand(id), ct);
            return result.ToResponse();
        })
        .WithTags("Products")
        .WithName(nameof(DeleteProduct));
    }
}
```

## 5. ResultExtensions (Error-to-HTTP Mapping)

The `ResultExtensions.ToResponse()` method maps `ErrorType` to HTTP status:

| ErrorType         | HTTP Status | When                    |
| ----------------- | ----------- | ----------------------- |
| NotFound          | 404         | Entity not found        |
| Validation        | 400         | Input validation failed |
| Conflict          | 409         | Duplicate/conflict      |
| Unauthorized      | 401         | Not authenticated       |
| Forbidden         | 403         | Not authorized          |
| Failure (default) | 400         | Generic failure         |

**Always use `.ToResponse()`** — never manually create error responses.

## 6. Routing Conventions

- **Base path**: `api/{feature-plural}` (e.g., `api/products`, `api/orders`)
- **Single resource**: `api/{feature}/{id:guid}`
- Use lowercase, plural nouns
- Use route constraints: `{id:guid}`, `{id:int}`
- Group with `.WithTags("{FeatureName}")` for Swagger organization
- Name with `.WithName(nameof(ClassName))` for link generation

## 7. Program.cs Pipeline

Production order in `Showcase.Api/Program.cs`:

```csharp
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApi(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseRateLimiter();       // ← Enforce rate limits before auth

app.UseAuthentication();
app.UseAuthorization();

// Health Checks
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/health", new HealthCheckOptions { ResponseWriter = CustomJsonResponseWriter });

app.MapEndpoints();

app.Run();
```

## 8. Rate Limiting (.NET 10 Built-In)

Registered in `DependencyInjection.AddApi()`:

- **`auth-policy`**: 10 req/min per IP (for `login`, `register`, `refresh-token`, `change-password`, `change-email`, `change-username`).
- **`upload-policy`**: 15 req/min per User/IP (for presigned upload URLs).
- **`general-policy`**: 100 req/min per IP for public browsing.

Attach to endpoints:

```csharp
app.MapPost("api/auth/login", ...)
    .RequireRateLimiting("auth-policy")
    .ProducesProblem(StatusCodes.Status429TooManyRequests);
```

Rejection handler returns standard RFC 7807 ProblemDetails with HTTP 429.

## 9. Feature Workflow — Step 4: API Layer (Final)

After Application (Step 3):

1. Create endpoint class in `Endpoints/{FeatureName}/`
2. Implement `IEndpoint`
3. Map route, inject `ISender`, send command/query, return `.ToResponse()`
4. Add `.WithTags()`, `.WithName()`, and appropriate `.RequireRateLimiting()`
5. Feature complete — auto-discovered, no manual wiring

## 10. Rules (CRITICAL)

- ❌ NEVER use Controllers — this project uses Minimal APIs
- ❌ NEVER manually create HTTP error responses — use `.ToResponse()`
- ❌ NEVER put business logic in endpoints — delegate to MediatR handlers
- ❌ NEVER manually register endpoints — they're auto-discovered
- ❌ NEVER return 403 Forbidden for Draft/Unpublished entities queried by ID — return **404 Not Found** so external visitors cannot infer the resource's existence.
- ⚠️ EF Core Aggregate Invariant: When child entities inherit from `BaseEntity` with pre-assigned `Guid` keys, explicitly call `_context.ChildEntities.Add(child)` in the handler so EF Core tracks them as `EntityState.Added` (preventing `DbUpdateConcurrencyException`).
- ✅ ALWAYS one class per endpoint
- ✅ ALWAYS use `ISender` (not `IMediator`) for sending commands/queries
- ✅ ALWAYS include `.WithTags()` and `.WithName()`
- ✅ ALWAYS use `.ToResponse()` for all responses
- ✅ ALWAYS inject `CancellationToken` and pass it through
- ✅ ALWAYS protect sensitive endpoints (login, register, upload URLs) with Rate Limiting
