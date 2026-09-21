using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Moq;
using Showcase.Infrastructure.Identity;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class IdentityServiceTests
{
    private static Mock<UserManager<ApplicationUser>> CreateMockUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
    }

    #region GetUserByUsernameAsync Tests

    [Fact]
    public async Task GetUserByUsernameAsync_Should_Return_NotFound_When_User_Does_Not_Exist()
    {
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByNameAsync("unknown"))
            .ReturnsAsync((ApplicationUser?)null);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.GetUserByUsernameAsync("unknown", CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.UserNotFound", result.Error.Code);
    }

    [Fact]
    public async Task GetUserByUsernameAsync_Should_Return_Details_When_User_Exists()
    {
        var user = new ApplicationUser
        {
            Id = "user-1",
            UserName = "creator_pro",
            Email = "creator@test.com"
        };

        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByNameAsync("creator_pro"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Creator" });

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.GetUserByUsernameAsync("creator_pro", CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("user-1", result.Value.Id);
        Assert.Equal("creator_pro", result.Value.UserName);
        Assert.Equal("creator@test.com", result.Value.Email);
        Assert.Contains("Creator", result.Value.Roles);
    }

    #endregion

    #region ChangePasswordAsync Tests

    [Fact]
    public async Task ChangePasswordAsync_Should_Return_NotFound_When_User_Not_Found()
    {
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("non-existent"))
            .ReturnsAsync((ApplicationUser?)null);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangePasswordAsync("non-existent", "OldPass1!", "NewPass2!", CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.UserNotFound", result.Error.Code);
    }

    [Fact]
    public async Task ChangePasswordAsync_Should_Return_Validation_When_Change_Fails()
    {
        var user = new ApplicationUser { Id = "user-1" };
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.ChangePasswordAsync(user, "WrongOldPass!", "NewPass2!"))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Incorrect password." }));

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangePasswordAsync("user-1", "WrongOldPass!", "NewPass2!", CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.ChangePasswordFailed", result.Error.Code);
    }

    [Fact]
    public async Task ChangePasswordAsync_Should_Succeed_When_UserManager_Succeeds()
    {
        var user = new ApplicationUser { Id = "user-1" };
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.ChangePasswordAsync(user, "OldPass1!", "NewPass2!"))
            .ReturnsAsync(IdentityResult.Success);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangePasswordAsync("user-1", "OldPass1!", "NewPass2!", CancellationToken.None);

        Assert.True(result.IsSuccess);
    }

    #endregion

    #region ChangeEmailAsync Tests

    [Fact]
    public async Task ChangeEmailAsync_Should_Return_Unauthorized_When_Current_Password_Invalid()
    {
        var user = new ApplicationUser { Id = "user-1", Email = "old@test.com" };
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, "WrongPass!"))
            .ReturnsAsync(false);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangeEmailAsync("user-1", "new@test.com", "WrongPass!", CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidPassword", result.Error.Code);
    }

    [Fact]
    public async Task ChangeEmailAsync_Should_Return_Conflict_When_Email_Taken()
    {
        var user = new ApplicationUser { Id = "user-1", Email = "old@test.com" };
        var otherUser = new ApplicationUser { Id = "user-2", Email = "new@test.com" };
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, "CorrectPass!"))
            .ReturnsAsync(true);
        userManagerMock
            .Setup(x => x.FindByEmailAsync("new@test.com"))
            .ReturnsAsync(otherUser);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangeEmailAsync("user-1", "new@test.com", "CorrectPass!", CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.EmailTaken", result.Error.Code);
    }

    [Fact]
    public async Task ChangeEmailAsync_Should_Succeed_When_Valid()
    {
        var user = new ApplicationUser { Id = "user-1", Email = "old@test.com" };
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, "CorrectPass!"))
            .ReturnsAsync(true);
        userManagerMock
            .Setup(x => x.FindByEmailAsync("new@test.com"))
            .ReturnsAsync((ApplicationUser?)null);
        userManagerMock
            .Setup(x => x.GenerateChangeEmailTokenAsync(user, "new@test.com"))
            .ReturnsAsync("valid-token");
        userManagerMock
            .Setup(x => x.ChangeEmailAsync(user, "new@test.com", "valid-token"))
            .ReturnsAsync(IdentityResult.Success);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangeEmailAsync("user-1", "new@test.com", "CorrectPass!", CancellationToken.None);

        Assert.True(result.IsSuccess);
    }

    #endregion

    #region ChangeUsernameAsync Tests

    [Fact]
    public async Task ChangeUsernameAsync_Should_Return_Unauthorized_When_Current_Password_Invalid()
    {
        var user = new ApplicationUser { Id = "user-1", UserName = "oldname" };
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, "WrongPass!"))
            .ReturnsAsync(false);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangeUsernameAsync("user-1", "newname", "WrongPass!", CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidPassword", result.Error.Code);
    }

    [Fact]
    public async Task ChangeUsernameAsync_Should_Return_Conflict_When_Username_Taken()
    {
        var user = new ApplicationUser { Id = "user-1", UserName = "oldname" };
        var otherUser = new ApplicationUser { Id = "user-2", UserName = "newname" };
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, "CorrectPass!"))
            .ReturnsAsync(true);
        userManagerMock
            .Setup(x => x.FindByNameAsync("newname"))
            .ReturnsAsync(otherUser);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangeUsernameAsync("user-1", "newname", "CorrectPass!", CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.UsernameTaken", result.Error.Code);
    }

    [Fact]
    public async Task ChangeUsernameAsync_Should_Succeed_When_Valid()
    {
        var user = new ApplicationUser { Id = "user-1", UserName = "oldname" };
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.CheckPasswordAsync(user, "CorrectPass!"))
            .ReturnsAsync(true);
        userManagerMock
            .Setup(x => x.FindByNameAsync("newname"))
            .ReturnsAsync((ApplicationUser?)null);
        userManagerMock
            .Setup(x => x.SetUserNameAsync(user, "newname"))
            .ReturnsAsync(IdentityResult.Success);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.ChangeUsernameAsync("user-1", "newname", "CorrectPass!", CancellationToken.None);

        Assert.True(result.IsSuccess);
    }

    #endregion

    #region RevokeRefreshTokenAsync Tests

    [Fact]
    public async Task RevokeRefreshTokenAsync_Should_Return_NotFound_When_User_Not_Found()
    {
        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("non-existent"))
            .ReturnsAsync((ApplicationUser?)null);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.RevokeRefreshTokenAsync("non-existent", CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.UserNotFound", result.Error.Code);
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_Should_Clear_RefreshToken_And_Expiry_When_User_Found()
    {
        var user = new ApplicationUser
        {
            Id = "user-1",
            RefreshToken = "existing-refresh-token",
            RefreshTokenExpiryTime = System.DateTime.UtcNow.AddDays(7)
        };

        var userManagerMock = CreateMockUserManager();
        userManagerMock
            .Setup(x => x.FindByIdAsync("user-1"))
            .ReturnsAsync(user);
        userManagerMock
            .Setup(x => x.UpdateAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        var service = new IdentityService(userManagerMock.Object);
        var result = await service.RevokeRefreshTokenAsync("user-1", CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Null(user.RefreshToken);
        Assert.Null(user.RefreshTokenExpiryTime);
        userManagerMock.Verify(x => x.UpdateAsync(user), Times.Once);
    }

    #endregion
}
