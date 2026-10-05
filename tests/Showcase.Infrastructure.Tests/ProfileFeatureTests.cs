using Moq;
using Showcase.Application.Features.Profiles.Commands;
using Showcase.Application.Features.Profiles.Queries;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class ProfileFeatureTests
{
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IIdentityService> _identityServiceMock = new();
    private readonly Mock<IStorageService> _storageServiceMock = new();

    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    #region UpdateProfile Tests

    [Fact]
    public void UpdateProfileValidator_Should_Pass_For_Valid_Data()
    {
        var validator = new UpdateProfileCommandValidator();
        var command = new UpdateProfileCommand("John Doe", "Architect", "Jordan", "Passionate software engineer.");

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void UpdateProfileValidator_Should_Fail_When_Name_Empty()
    {
        var validator = new UpdateProfileCommandValidator();
        var command = new UpdateProfileCommand("", null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void UpdateProfileValidator_Should_Fail_When_Bio_Exceeds_MaxLength()
    {
        var validator = new UpdateProfileCommandValidator();
        var command = new UpdateProfileCommand("John Doe", null, null, new string('a', 1001));

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Bio);
    }

    [Fact]
    public async Task UpdateProfileHandler_Should_Fail_When_Unauthenticated()
    {
        using var context = CreateInMemoryDbContext();
        _currentUserServiceMock.Setup(x => x.UserId).Returns((string?)null);

        var handler = new UpdateProfileCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new UpdateProfileCommand("John Doe", null, null, "Bio"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.Unauthorized", result.Error.Code);
    }

    [Fact]
    public async Task UpdateProfileHandler_Should_Fail_When_Profile_Not_Found()
    {
        using var context = CreateInMemoryDbContext();
        _currentUserServiceMock.Setup(x => x.UserId).Returns("non-existing-user");

        var handler = new UpdateProfileCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new UpdateProfileCommand("John Doe", null, null, "Bio"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Profile.NotFoundForUser", result.Error.Code);
    }

    [Fact]
    public async Task UpdateProfileHandler_Should_Succeed_And_Update_Details()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "Old Name");
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new UpdateProfileCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(
            new UpdateProfileCommand("New Name", null, null, "Updated Bio"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updated = await context.Profiles.FirstAsync(p => p.UserId == "user-1");
        Assert.Equal("New Name", updated.Name);
        Assert.Equal("Updated Bio", updated.Bio?.Value);
        Assert.NotNull(updated.UpdatedAt);
    }

    #endregion

    #region Avatar Tests

    [Theory]
    [InlineData("image/jpeg", 1024, true)]
    [InlineData("image/png", 2048, true)]
    [InlineData("image/webp", 4096, true)]
    [InlineData("image/gif", 8192, true)]
    [InlineData("application/pdf", 1024, false)]
    [InlineData("image/jpeg", 0, false)]
    [InlineData("image/jpeg", 6 * 1024 * 1024, false)]
    public void GetAvatarUploadUrlValidator_Should_Validate_Correctly(string contentType, long sizeBytes, bool shouldPass)
    {
        var validator = new GetAvatarUploadUrlCommandValidator();
        var command = new GetAvatarUploadUrlCommand(contentType, sizeBytes);

        var result = validator.TestValidate(command);
        Assert.Equal(shouldPass, result.IsValid);
    }

    [Fact]
    public async Task GetAvatarUploadUrlHandler_Should_Return_Presigned_Url_And_Storage_Key()
    {
        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _storageServiceMock
            .Setup(x => x.GetPresignedUploadUrlAsync(It.IsAny<string>(), "image/png", It.IsAny<TimeSpan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("https://upload.r2.com/presigned");

        var handler = new GetAvatarUploadUrlCommandHandler(_storageServiceMock.Object, _currentUserServiceMock.Object);
        var result = await handler.Handle(new GetAvatarUploadUrlCommand("image/png", 1024), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("https://upload.r2.com/presigned", result.Value.UploadUrl);
        Assert.Contains("avatars/user-1/", result.Value.StorageKey);
        Assert.EndsWith(".png", result.Value.StorageKey);
    }

    [Fact]
    public async Task UpdateAvatarHandler_Should_Update_Avatar_And_Delete_Old()
    {
        using var context = CreateInMemoryDbContext();
        var oldKey = StorageKey.Create("avatars/user-1/old.png").Value;
        var profile = new Profile("user-1", "John Doe", avatarKey: oldKey);
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _storageServiceMock
            .Setup(x => x.DeleteAsync("avatars/user-1/old.png", It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdateAvatarCommandHandler(context, _currentUserServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new UpdateAvatarCommand("avatars/user-1/new.png"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updated = await context.Profiles.FirstAsync(p => p.UserId == "user-1");
        Assert.Equal("avatars/user-1/new.png", updated.AvatarKey?.Value);

        _storageServiceMock.Verify(x => x.DeleteAsync("avatars/user-1/old.png", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RemoveAvatarHandler_Should_Delete_And_Set_Null()
    {
        using var context = CreateInMemoryDbContext();
        var oldKey = StorageKey.Create("avatars/user-1/avatar.png").Value;
        var profile = new Profile("user-1", "John Doe", avatarKey: oldKey);
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _storageServiceMock
            .Setup(x => x.DeleteAsync("avatars/user-1/avatar.png", It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new RemoveAvatarCommandHandler(context, _currentUserServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new RemoveAvatarCommand(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updated = await context.Profiles.FirstAsync(p => p.UserId == "user-1");
        Assert.Null(updated.AvatarKey);

        _storageServiceMock.Verify(x => x.DeleteAsync("avatars/user-1/avatar.png", It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Query Tests

    [Fact]
    public async Task GetMyProfileHandler_Should_Return_Full_Profile_With_Avatar_And_Links()
    {
        using var context = CreateInMemoryDbContext();
        var avatarKey = StorageKey.Create("avatars/user-1/pic.jpg").Value;
        var profile = new Profile("user-1", "John Doe", bio: Bio.Create("My Bio").Value, avatarKey: avatarKey);
        var url1 = Url.Create("https://github.com/john").Value;
        var url2 = Url.Create("https://linkedin.com/in/john").Value;
        profile.AddSocialLink("GitHub", url1, 1);
        profile.AddSocialLink("LinkedIn", url2, 0);
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _identityServiceMock
            .Setup(x => x.GetUserByIdAsync("user-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserIdentityDetails("user-1", "john@test.com", "johndoe", new List<string>()));
        _storageServiceMock
            .Setup(x => x.GetPublicUrl("avatars/user-1/pic.jpg"))
            .Returns("https://cdn.example.com/avatars/user-1/pic.jpg");

        var handler = new GetMyProfileQueryHandler(context, _currentUserServiceMock.Object, _identityServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new GetMyProfileQuery(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var resp = result.Value;
        Assert.Equal("johndoe", resp.Username);
        Assert.Equal("john@test.com", resp.Email);
        Assert.Equal("John Doe", resp.Name);
        Assert.Equal("My Bio", resp.Bio);
        Assert.Equal("https://cdn.example.com/avatars/user-1/pic.jpg", resp.AvatarUrl);
        Assert.Equal(2, resp.SocialLinks.Count);
        // Verify ordering: displayOrder 0 (LinkedIn) then 1 (GitHub)
        Assert.Equal("LinkedIn", resp.SocialLinks.First().Platform);
        Assert.Equal("GitHub", resp.SocialLinks.Last().Platform);
    }

    [Fact]
    public async Task GetPublicProfileHandler_Should_Return_Public_View_By_Username()
    {
        using var context = CreateInMemoryDbContext();
        var avatarKey = StorageKey.Create("avatars/creator-1/pic.jpg").Value;
        var profile = new Profile("creator-1", "Jane Smith", bio: Bio.Create("Public creator").Value, avatarKey: avatarKey);
        var url = Url.Create("https://x.com/janesmith").Value;
        profile.AddSocialLink("X", url, 0);
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _identityServiceMock
            .Setup(x => x.GetUserByUsernameAsync("janesmith", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserIdentityDetails("creator-1", "jane@test.com", "janesmith", new List<string>()));
        _storageServiceMock
            .Setup(x => x.GetPublicUrl("avatars/creator-1/pic.jpg"))
            .Returns("https://cdn.example.com/avatars/creator-1/pic.jpg");

        var handler = new GetPublicProfileQueryHandler(context, _identityServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new GetPublicProfileQuery("janesmith"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var resp = result.Value;
        Assert.Equal("janesmith", resp.Username);
        Assert.Equal("Jane Smith", resp.Name);
        Assert.Equal("Public creator", resp.Bio);
        Assert.Equal("https://cdn.example.com/avatars/creator-1/pic.jpg", resp.AvatarUrl);
        Assert.Single(resp.SocialLinks);
        Assert.Equal("X", resp.SocialLinks.First().Platform);
    }

    [Fact]
    public async Task GetPublicProfileHandler_Should_Return_NotFound_When_User_Does_Not_Exist()
    {
        using var context = CreateInMemoryDbContext();
        _identityServiceMock
            .Setup(x => x.GetUserByUsernameAsync("unknown", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Error.NotFound("Auth.UserNotFound", "User not found."));

        var handler = new GetPublicProfileQueryHandler(context, _identityServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new GetPublicProfileQuery("unknown"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.UserNotFound", result.Error.Code);
    }

    #endregion
}

