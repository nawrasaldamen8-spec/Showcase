using Showcase.Api.DependencyInjection;
using Showcase.Application.Common.DependencyInjection;
using Showcase.Infrastructure.DependencyInjection;
using Showcase.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Load local overrides if present (ignored in git)
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.local.json", optional: true, reloadOnChange: true);

// Add layer dependencies
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApi(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Security: Enforce strict no-cache headers on all administrative API endpoints
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/admin"))
    {
        context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
        context.Response.Headers.Pragma = "no-cache";
    }
    await next();
});

app.MapHub<NotificationHub>("/hubs/notifications");

app.MapEndpoints();

await app.InitialiseDatabaseAsync();

app.Run();
