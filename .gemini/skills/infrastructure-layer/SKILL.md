---
name: infrastructure-layer
description: >-
  Use this skill when adding entities to the database, creating EF Core configurations, running migrations, registering services, or working with the Options pattern in the Architecture.Infrastructure project.
---

# Infrastructure Layer

## 1. Layer Role
- Infrastructure = data access, external services, framework implementations
- Project: `Architecture.Infrastructure`
- Depends on: `Architecture.Application`, `Architecture.Domain`
- Uses: EF Core (10.0.12) with SQL Server

## 2. File Structure
```
Architecture.Infrastructure/
├── Data/
│   ├── ApplicationDbContext.cs              → Main DbContext, implements IApplicationDbContext
│   ├── Configurations/
│   │   └── {EntityName}Configuration.cs     → IEntityTypeConfiguration<T>
│   └── Migrations/                          → EF Core auto-generated
├── DependencyInjection/
│   └── DependencyInjection.cs               → AddInfrastructure() extension
└── Services/
    └── {ServiceName}.cs                     → External service implementations (optional)
```

## 3. ApplicationDbContext
Current implementation:
```csharp
using Architecture.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Architecture.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    // Add DbSet properties here for each entity:
    // public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

## 4. Adding a New Entity — Step by Step
1. Add DbSet to ApplicationDbContext:
```csharp
public DbSet<Product> Products => Set<Product>();
```
(Use expression-bodied property, NOT `{ get; set; }`)

2. Create Configuration file at `Data/Configurations/ProductConfiguration.cs`:
```csharp
using Architecture.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Architecture.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.Price)
            .HasPrecision(18, 2);

        builder.HasIndex(p => p.Name)
            .IsUnique();
    }
}
```

Key points:
- Configuration classes are auto-discovered via `ApplyConfigurationsFromAssembly` — no manual registration
- Use Fluent API (NOT data annotations) for all constraints
- Always set `HasKey`, `IsRequired`, `HasMaxLength`, `HasPrecision` as needed
- Namespace: `Architecture.Infrastructure.Data.Configurations`

3. Run migration:
```bash
dotnet ef migrations add AddProduct --project Architecture.Infrastructure --startup-project Architecture.Api
dotnet ef database update --project Architecture.Infrastructure --startup-project Architecture.Api
```

## 5. DI Registration
Current `AddInfrastructure()` method:
```csharp
public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
{
    var connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? "Server=(localdb)\\mssqllocaldb;Database=ArchitectureDb;Trusted_Connection=True;MultipleActiveResultSets=true";

    services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
    services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

    return services;
}
```

When adding new services:
- Define interface in Application (`Common/Interfaces/I{Service}.cs`)
- Implement in Infrastructure (`Services/{Service}.cs`)
- Register in `AddInfrastructure()`: `services.AddScoped<IService, Service>();`

## 6. Configuration & Options Pattern
How to add a new configuration section:

1. Add to `appsettings.json`:
```json
{
  "JwtSettings": {
    "Secret": "your-secret-key-here",
    "Issuer": "Architecture.Api",
    "Audience": "Architecture.Api",
    "ExpiryMinutes": 60
  }
}
```

2. Create options class (place in the layer that owns it):
```csharp
namespace Architecture.Infrastructure.Identity;

public class JwtSettings
{
    public const string SectionName = "JwtSettings";
    public string Secret { get; init; } = string.Empty;
    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public int ExpiryMinutes { get; init; } = 60;
}
```

3. Register in `AddInfrastructure()`:
```csharp
services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
```

4. Inject via `IOptions<JwtSettings>` in services:
```csharp
public class TokenService
{
    private readonly JwtSettings _jwtSettings;
    public TokenService(IOptions<JwtSettings> options) => _jwtSettings = options.Value;
}
```

Rules:
- Options classes for infrastructure concerns (DB, external APIs, JWT) → place in Infrastructure
- Options classes for application concerns (feature toggles) → place in Application
- Always use `const string SectionName` for the config key
- Use `init` setters in options classes

## 7. Feature Workflow — Step 2: Infrastructure Layer
After Domain (Step 1):
1. Add `DbSet<Entity>` to ApplicationDbContext
2. Create `IEntityTypeConfiguration<Entity>` in `Data/Configurations/`
3. Run `dotnet ef migrations add {Name}`
4. Next → go to application-layer skill (Step 3)

## 8. Rules (CRITICAL)
- ❌ NEVER put business logic in Infrastructure
- ❌ NEVER use data annotations — always Fluent API
- ❌ NEVER manually register configuration classes — they're auto-discovered
- ✅ ALWAYS create a configuration class for every entity
- ✅ ALWAYS use expression-bodied DbSet properties: `public DbSet<T> Ts => Set<T>();`
- ✅ ALWAYS run migrations after adding/changing entity configurations
- ✅ ALWAYS define service interfaces in Application, implementations in Infrastructure
