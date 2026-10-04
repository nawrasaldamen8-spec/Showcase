using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Analytics;
using Showcase.Application.Features.Lookups.Queries;
using Showcase.Application.Features.Notifications.Commands;
using Showcase.Application.Features.Notifications.Queries;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class LookupsAndNotificationsFeatureTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetCountries_And_Languages_Should_Return_Lookup_Data()
    {
        var dbContext = CreateInMemoryDbContext();
        dbContext.Countries.Add(new Country(400, "jo", "jor", "Jordan"));
        dbContext.Countries.Add(new Country(840, "us", "usa", "United States"));
        dbContext.LanguageReferences.Add(new LanguageReference("ar", "Arabic"));
        dbContext.LanguageReferences.Add(new LanguageReference("en", "English"));
        await dbContext.SaveChangesAsync();

        var countriesHandler = new GetCountriesQueryHandler(dbContext);
        var countriesResult = await countriesHandler.Handle(new GetCountriesQuery(), CancellationToken.None);

        Assert.True(countriesResult.IsSuccess);
        Assert.Equal(2, countriesResult.Value.Count);

        var languagesHandler = new GetLanguagesQueryHandler(dbContext);
        var languagesResult = await languagesHandler.Handle(new GetLanguagesQuery(), CancellationToken.None);

        Assert.True(languagesResult.IsSuccess);
        Assert.Equal(2, languagesResult.Value.Count);
    }

    [Fact]
    public async Task Notifications_Lifecycle_Should_Work()
    {
        var dbContext = CreateInMemoryDbContext();
        var currentUserService = new Mock<ICurrentUserService>();
        currentUserService.Setup(s => s.UserId).Returns("user-1");

        var n1 = new Notification("user-1", NotificationType.System, "Alert 1", "System notice");
        var n2 = new Notification("user-1", NotificationType.Like, "Like Alert", "Someone liked your post");
        dbContext.Notifications.AddRange(n1, n2);
        await dbContext.SaveChangesAsync();

        var identityService = new Mock<IIdentityService>();
        IReadOnlyDictionary<string, UserIdentityDetails> emptyDict = new Dictionary<string, UserIdentityDetails>();
        identityService.Setup(s => s.GetUsersByIdsAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Showcase.Domain.Common.Results.Result<IReadOnlyDictionary<string, UserIdentityDetails>>.Success(emptyDict));
        var storageService = new Mock<IStorageService>();

        // 1. Get notifications
        var getHandler = new GetNotificationsQueryHandler(currentUserService.Object, dbContext, identityService.Object, storageService.Object);
        var getResult = await getHandler.Handle(new GetNotificationsQuery(), CancellationToken.None);
        Assert.True(getResult.IsSuccess);
        Assert.Equal(2, getResult.Value.Items.Count);

        // 2. Mark single notification as read
        var readHandler = new MarkNotificationAsReadCommandHandler(currentUserService.Object, dbContext);
        var readResult = await readHandler.Handle(new MarkNotificationAsReadCommand(n1.Id), CancellationToken.None);
        Assert.True(readResult.IsSuccess);
        Assert.True(n1.IsRead);

        // 3. Delete notification
        var deleteHandler = new DeleteNotificationCommandHandler(currentUserService.Object, dbContext);
        var deleteResult = await deleteHandler.Handle(new DeleteNotificationCommand(n1.Id), CancellationToken.None);
        Assert.True(deleteResult.IsSuccess);
        Assert.Equal(1, await dbContext.Notifications.CountAsync(n => n.UserId == "user-1"));
    }

    [Fact]
    public async Task Analytics_Tracking_And_Query_Should_Work()
    {
        var dbContext = CreateInMemoryDbContext();
        var currentUserService = new Mock<ICurrentUserService>();
        currentUserService.Setup(s => s.UserId).Returns("owner-id");

        var profile = new Profile("owner-id", "Owner User");
        dbContext.Profiles.Add(profile);
        await dbContext.SaveChangesAsync();

        // 1. Track profile visit (by another user)
        var visitorService = new Mock<ICurrentUserService>();
        visitorService.Setup(s => s.UserId).Returns("visitor-id");

        var publisher = new Mock<MediatR.IPublisher>();
        var trackHandler = new TrackProfileVisitCommandHandler(visitorService.Object, dbContext, publisher.Object);
        var trackResult = await trackHandler.Handle(new TrackProfileVisitCommand(profile.Id, "hashed-ip-123"), CancellationToken.None);
        Assert.True(trackResult.IsSuccess);

        // 2. Query analytics (by owner)
        var analyticsHandler = new GetProfileAnalyticsQueryHandler(currentUserService.Object, dbContext);
        var analyticsResult = await analyticsHandler.Handle(new GetProfileAnalyticsQuery(), CancellationToken.None);

        Assert.True(analyticsResult.IsSuccess);
        Assert.Equal(1, analyticsResult.Value.TotalViews);
    }
}
