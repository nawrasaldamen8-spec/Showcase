---
name: api-layer
description: >-
  Use this skill when creating API endpoints, designing routes, handling HTTP responses, or working with the Architecture.Api project. Guides IEndpoint implementation, ResultExtensions usage, and RESTful API design.
---

# API Layer Guide

This guide teaches how to work with the API layer in this project. The API layer acts as the HTTP entry point, mapping requests to MediatR commands/queries.

## 1. Layer Role
- **API**: HTTP entry point, maps requests to MediatR commands/queries
- **Project**: `Architecture.Api`
- **Depends on**: `Architecture.Application`, `Architecture.Infrastructure`
- **Uses**: Minimal APIs (NOT controllers), auto-discovery endpoint pattern

## 2. File Structure

```text
Architecture.Api/
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
using Architecture.Api.Common.Results;
using Architecture.Application.Features.Products.Commands.CreateProduct;
using MediatR;

namespace Architecture.Api.Endpoints.Products;

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
namespace Architecture.Api.Endpoints.Products;

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
namespace Architecture.Api.Endpoints.Products;

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

| ErrorType | HTTP Status | When |
|-----------|-------------|------|
| NotFound | 404 | Entity not found |
| Validation | 400 | Input validation failed |
| Conflict | 409 | Duplicate/conflict |
| Unauthorized | 401 | Not authenticated |
| Forbidden | 403 | Not authorized |
| Failure (default) | 400 | Generic failure |

**Always use `.ToResponse()`** — never manually create error responses.

## 6. Routing Conventions

- **Base path**: `api/{feature-plural}` (e.g., `api/products`, `api/orders`)
- **Single resource**: `api/{feature}/{id:guid}`
- Use lowercase, plural nouns
- Use route constraints: `{id:guid}`, `{id:int}`
- Group with `.WithTags("{FeatureName}")` for Swagger organization
- Name with `.WithName(nameof(ClassName))` for link generation

## 7. Program.cs Pipeline

Current order:
```csharp
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApi(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();
// app.UseAuthentication();   ← add when needed
// app.UseAuthorization();    ← add when needed
app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.MapEndpoints();

app.Run();
```
Middleware order matters! Authentication → Authorization → CORS → Endpoints.

## 8. Feature Workflow — Step 4: API Layer (Final)

After Application (Step 3):
1. Create endpoint class in `Endpoints/{FeatureName}/`
2. Implement `IEndpoint`
3. Map route, inject `ISender`, send command/query, return `.ToResponse()`
4. Add `.WithTags()` and `.WithName()` for Swagger
5. Feature complete — auto-discovered, no manual wiring

## 9. Rules (CRITICAL)

- ❌ NEVER use Controllers — this project uses Minimal APIs
- ❌ NEVER manually create HTTP error responses — use `.ToResponse()`
- ❌ NEVER put business logic in endpoints — delegate to MediatR handlers
- ❌ NEVER manually register endpoints — they're auto-discovered
- ✅ ALWAYS one class per endpoint
- ✅ ALWAYS use `ISender` (not `IMediator`) for sending commands/queries
- ✅ ALWAYS include `.WithTags()` and `.WithName()`
- ✅ ALWAYS use `.ToResponse()` for all responses
- ✅ ALWAYS inject `CancellationToken` and pass it through
