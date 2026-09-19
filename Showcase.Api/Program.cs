using Showcase.Api.DependencyInjection;
using Showcase.Api.Endpoints;
using Showcase.Application.Common.DependencyInjection;
using Showcase.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

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
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapEndpoints();

app.Run();
