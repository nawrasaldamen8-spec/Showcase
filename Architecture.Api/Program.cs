using Architecture.Api.DependencyInjection;
using Architecture.Api.Endpoints;
using Architecture.Application.Common.DependencyInjection;
using Architecture.Infrastructure.DependencyInjection;

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

app.MapEndpoints();

app.Run();
