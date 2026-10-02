using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Admin.Broadcasts;
using Showcase.Application.Features.Admin.Dashboard;
using Showcase.Application.Features.Admin.Featured;
using Showcase.Application.Features.Admin.Reports;
using Showcase.Application.Features.Admin.Users;
using Showcase.Application.Features.Admin.Verifications;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class AdminFeatureTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetDashboardMetrics_Should_Calculate_Totals_Correctly()
    {
        var dbContext = CreateInMemoryDbContext();
        var profile1 = new Profile("u1", "User One");
        var profile2 = new Profile("u2", "User Two");
        dbContext.Profiles.AddRange(profile1, profile2);

        var post = new Post(profile1.Id, "Test Post", "Content");
        post.AddImage(StorageKey.Create("posts/1/image.png").Value, 0);
        post.Publish();
        dbContext.Posts.Add(post);
        await dbContext.SaveChangesAsync();

        var handler = new GetDashboardMetricsQueryHandler(dbContext);
        var result = await handler.Handle(new GetDashboardMetricsQuery(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.TotalUsersCount);
    }

    [Fact]
    public async Task BanUser_And_UnbanUser_Should_Update_Profile_Status()
    {
        var dbContext = CreateInMemoryDbContext();

        var profile = new Profile("u1", "Bad User");
        dbContext.Profiles.Add(profile);
        await dbContext.SaveChangesAsync();

        var auditLogger = new Mock<IAuditLogger>();
        var currentUserService = new Mock<ICurrentUserService>();
        currentUserService.Setup(c => c.UserId).Returns("admin1");
        currentUserService.Setup(c => c.Username).Returns("admin");

        var banHandler = new BanUserCommandHandler(dbContext, auditLogger.Object, currentUserService.Object);
        var banResult = await banHandler.Handle(new BanUserCommand("u1", "Violating terms of service"), CancellationToken.None);

        Assert.True(banResult.IsSuccess);
        Assert.True(profile.IsBanned);
        Assert.Equal("Violating terms of service", profile.BanReason);

        var unbanHandler = new UnbanUserCommandHandler(dbContext, auditLogger.Object, currentUserService.Object);
        var unbanResult = await unbanHandler.Handle(new UnbanUserCommand("u1"), CancellationToken.None);

        Assert.True(unbanResult.IsSuccess);
        Assert.False(profile.IsBanned);
    }

    [Fact]
    public async Task ApproveVerificationRequest_Should_Work()
    {
        var dbContext = CreateInMemoryDbContext();

        var profile = new Profile("u1", "Request User");
        dbContext.Profiles.Add(profile);

        var req = new VerificationRequest("u1", "National ID docs", "developer");
        dbContext.VerificationRequests.Add(req);
        await dbContext.SaveChangesAsync();

        var publisher = new Mock<MediatR.IPublisher>();
        var auditLogger = new Mock<IAuditLogger>();
        var currentUserService = new Mock<ICurrentUserService>();
        currentUserService.Setup(c => c.UserId).Returns("admin1");
        currentUserService.Setup(c => c.Username).Returns("admin");

        var approveHandler = new ApproveVerificationRequestCommandHandler(dbContext, publisher.Object, auditLogger.Object, currentUserService.Object);
        var approveResult = await approveHandler.Handle(new ApproveVerificationRequestCommand(req.Id, "Verified successfully"), CancellationToken.None);

        Assert.True(approveResult.IsSuccess);
        Assert.Equal(VerificationStatus.Verified, req.Status);
        Assert.True(profile.IsVerified);
    }

    [Fact]
    public async Task CreateBroadcast_And_GetBroadcasts_Should_Work()
    {
        var dbContext = CreateInMemoryDbContext();
        var notifier = new Mock<IRealtimeNotifier>();
        var createHandler = new CreateBroadcastCommandHandler(dbContext, notifier.Object);
        var createResult = await createHandler.Handle(new CreateBroadcastCommand(
            Title: "Platform Maintenance",
            Message: "System maintenance tonight at 2 AM",
            Severity: "info",
            ExpiresAt: DateTime.UtcNow.AddDays(1)
        ), CancellationToken.None);

        Assert.True(createResult.IsSuccess);

        var getHandler = new GetBroadcastsQueryHandler();
        var getResult = await getHandler.Handle(new GetBroadcastsQuery(), CancellationToken.None);

        Assert.True(getResult.IsSuccess);
        Assert.NotEmpty(getResult.Value);
    }
}
