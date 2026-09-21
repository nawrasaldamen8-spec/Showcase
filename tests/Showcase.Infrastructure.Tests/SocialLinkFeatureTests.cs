using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation.TestHelper;
using Microsoft.EntityFrameworkCore;
using Moq;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.SocialLinks.Commands.AddSocialLink;
using Showcase.Application.Features.SocialLinks.Commands.DeleteSocialLink;
using Showcase.Application.Features.SocialLinks.Commands.ReorderSocialLinks;
using Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class SocialLinkFeatureTests
{
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();

    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    #region AddSocialLink Tests

    [Fact]
    public void AddSocialLinkValidator_Should_Pass_For_Valid_Data()
    {
        var validator = new AddSocialLinkCommandValidator();
        var command = new AddSocialLinkCommand("GitHub", "https://github.com/myname", 1);

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "https://github.com/myname", 0, "Platform is required.")]
    [InlineData("GitHub", "", 0, "URL is required.")]
    [InlineData("GitHub", "invalid-url", 0, "URL must be a valid HTTP or HTTPS URL.")]
    public void AddSocialLinkValidator_Should_Fail_For_Invalid_Data(string platform, string url, int? order, string expectedError)
    {
        var validator = new AddSocialLinkCommandValidator();
        var command = new AddSocialLinkCommand(platform, url, order);

        var result = validator.TestValidate(command);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public async Task AddSocialLinkHandler_Should_Add_Link_To_Profile()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new AddSocialLinkCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new AddSocialLinkCommand("GitHub", "https://github.com/johndoe", 0), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("GitHub", result.Value.Platform);
        Assert.Equal("https://github.com/johndoe", result.Value.Url);

        var updatedProfile = await context.Profiles.Include(p => p.SocialLinks).FirstAsync(p => p.UserId == "user-1");
        Assert.Single(updatedProfile.SocialLinks);
    }

    #endregion

    #region UpdateSocialLink Tests

    [Fact]
    public void UpdateSocialLinkValidator_Should_Pass_For_Valid_Data()
    {
        var validator = new UpdateSocialLinkCommandValidator();
        var command = new UpdateSocialLinkCommand(Guid.NewGuid(), "LinkedIn", "https://linkedin.com/in/john");

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task UpdateSocialLinkHandler_Should_Update_Link()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        var link = profile.AddSocialLink("OldPlatform", Url.Create("https://old.com").Value, 0);
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new UpdateSocialLinkCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new UpdateSocialLinkCommand(link.Id, "NewPlatform", "https://new.com"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updatedProfile = await context.Profiles.Include(p => p.SocialLinks).FirstAsync(p => p.UserId == "user-1");
        var updatedLink = updatedProfile.SocialLinks.First(l => l.Id == link.Id);
        Assert.Equal("NewPlatform", updatedLink.Platform);
        Assert.Equal("https://new.com", updatedLink.Url.Value);
    }

    [Fact]
    public async Task UpdateSocialLinkHandler_Should_Fail_When_Link_Not_Found()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new UpdateSocialLinkCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new UpdateSocialLinkCommand(Guid.NewGuid(), "NewPlatform", "https://new.com"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("SocialLink.NotFound", result.Error.Code);
    }

    #endregion

    #region DeleteSocialLink Tests

    [Fact]
    public async Task DeleteSocialLinkHandler_Should_Remove_Link()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        var link = profile.AddSocialLink("Platform", Url.Create("https://link.com").Value, 0);
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new DeleteSocialLinkCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new DeleteSocialLinkCommand(link.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updatedProfile = await context.Profiles.Include(p => p.SocialLinks).FirstAsync(p => p.UserId == "user-1");
        Assert.Empty(updatedProfile.SocialLinks);
    }

    #endregion

    #region ReorderSocialLinks Tests

    [Fact]
    public void ReorderSocialLinksValidator_Should_Validate_Correctly()
    {
        var validator = new ReorderSocialLinksCommandValidator();
        var validCommand = new ReorderSocialLinksCommand(new List<ReorderSocialLinkItem>
        {
            new(Guid.NewGuid(), 1),
            new(Guid.NewGuid(), 0)
        });

        var result = validator.TestValidate(validCommand);
        result.ShouldNotHaveAnyValidationErrors();

        var emptyCommand = new ReorderSocialLinksCommand(new List<ReorderSocialLinkItem>());
        var emptyResult = validator.TestValidate(emptyCommand);
        Assert.False(emptyResult.IsValid);
    }

    [Fact]
    public async Task ReorderSocialLinksHandler_Should_Update_Display_Orders()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        var link1 = profile.AddSocialLink("Platform1", Url.Create("https://p1.com").Value, 0);
        var link2 = profile.AddSocialLink("Platform2", Url.Create("https://p2.com").Value, 1);
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new ReorderSocialLinksCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new ReorderSocialLinksCommand(new List<ReorderSocialLinkItem>
        {
            new(link1.Id, 10),
            new(link2.Id, 5)
        }), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updatedProfile = await context.Profiles.Include(p => p.SocialLinks).FirstAsync(p => p.UserId == "user-1");
        Assert.Equal(10, updatedProfile.SocialLinks.First(l => l.Id == link1.Id).DisplayOrder);
        Assert.Equal(5, updatedProfile.SocialLinks.First(l => l.Id == link2.Id).DisplayOrder);
    }

    #endregion
}
