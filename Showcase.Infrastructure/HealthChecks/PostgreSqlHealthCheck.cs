using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Showcase.Infrastructure.Data;

namespace Showcase.Infrastructure.HealthChecks;

public class PostgreSqlHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _context;

    public PostgreSqlHealthCheck(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            if (canConnect)
            {
                return HealthCheckResult.Healthy("PostgreSQL database connection is operational.");
            }

            return HealthCheckResult.Unhealthy("Unable to establish connection to PostgreSQL database.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Exception encountered while checking PostgreSQL database connection.", ex);
        }
    }
}
