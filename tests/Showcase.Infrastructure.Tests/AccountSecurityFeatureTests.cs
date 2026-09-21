using System.Threading;
using System.Threading.Tasks;
using FluentValidation.TestHelper;
using Moq;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Auth.Commands.ChangeEmail;
using Showcase.Application.Features.Auth.Commands.ChangePassword;
using Showcase.Application.Features.Auth.Commands.ChangeUsername;
using Showcase.Domain.Common.Results;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class AccountSecurityFeatureTests
{
    private readonly Mock<IIdentityService> _identityServiceMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();

    #region ChangePassword Tests

    [Fact]
    public void ChangePasswordValidator_Should_Pass_For_Valid_Data()
    {
        var validator = new ChangePasswordCommandValidator();
        var command = new ChangePasswordCommand("OldPass123!", "NewPass456!");

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "NewPass456!", "Current password is required.")]
    [InlineData("OldPass123!", "", "NewPassword")]
    [InlineData("OldPass123!", "short1!", "New password must be at least 8 characters long.")]
    [InlineData("OldPass123!", "nouppercase123!", "New password must contain at least one uppercase letter.")]
    [InlineData("OldPass123!", "NOLOWERCASE123!", "New password must contain at least one lowercase letter.")]
    [InlineData("OldPass123!", "NoDigitsHere!", "New password must contain at least one digit.")]
    [InlineData("OldPass123!", "NoSpecialChar123", "New password must contain at least one non-alphanumeric character.")]
    [InlineData("SamePassword123!", "SamePassword123!", "New password cannot be the same as current password.")]
    public void ChangePasswordValidator_Should_Fail_For_Invalid_Data(string currentPassword, string newPassword, string expectedErrorSubstr)
    {
        var validator = new ChangePasswordCommandValidator();
        var command = new ChangePasswordCommand(currentPassword, newPassword);

        var result = validator.TestValidate(command);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains(expectedErrorSubstr) || e.PropertyName.Contains(expectedErrorSubstr));
    }

    [Fact]
    public async Task ChangePasswordHandler_Should_Fail_When_User_Not_Authenticated()
    {
        _currentUserServiceMock.Setup(x => x.UserId).Returns((string?)null);

        var handler = new ChangePasswordCommandHandler(_identityServiceMock.Object, _currentUserServiceMock.Object);
        var result = await handler.Handle(new ChangePasswordCommand("OldPass123!", "NewPass456!"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.Unauthorized", result.Error.Code);
    }

    [Fact]
    public async Task ChangePasswordHandler_Should_Succeed_When_Identity_Succeeds()
    {
        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _identityServiceMock
            .Setup(x => x.ChangePasswordAsync("user-1", "OldPass123!", "NewPass456!", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var handler = new ChangePasswordCommandHandler(_identityServiceMock.Object, _currentUserServiceMock.Object);
        var result = await handler.Handle(new ChangePasswordCommand("OldPass123!", "NewPass456!"), CancellationToken.None);

        Assert.True(result.IsSuccess);
    }

    #endregion

    #region ChangeEmail Tests

    [Fact]
    public void ChangeEmailValidator_Should_Pass_For_Valid_Data()
    {
        var validator = new ChangeEmailCommandValidator();
        var command = new ChangeEmailCommand("new@example.com", "Password123!");

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "Password123!", "New email is required.")]
    [InlineData("not-an-email", "Password123!", "New email must be a valid email address.")]
    [InlineData("valid@example.com", "", "Current password is required.")]
    public void ChangeEmailValidator_Should_Fail_For_Invalid_Data(string email, string password, string expectedError)
    {
        var validator = new ChangeEmailCommandValidator();
        var command = new ChangeEmailCommand(email, password);

        var result = validator.TestValidate(command);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public async Task ChangeEmailHandler_Should_Fail_When_User_Not_Authenticated()
    {
        _currentUserServiceMock.Setup(x => x.UserId).Returns((string?)null);

        var handler = new ChangeEmailCommandHandler(_identityServiceMock.Object, _currentUserServiceMock.Object);
        var result = await handler.Handle(new ChangeEmailCommand("new@example.com", "Password123!"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.Unauthorized", result.Error.Code);
    }

    [Fact]
    public async Task ChangeEmailHandler_Should_Succeed_When_Identity_Succeeds()
    {
        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _identityServiceMock
            .Setup(x => x.ChangeEmailAsync("user-1", "new@example.com", "Password123!", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var handler = new ChangeEmailCommandHandler(_identityServiceMock.Object, _currentUserServiceMock.Object);
        var result = await handler.Handle(new ChangeEmailCommand("new@example.com", "Password123!"), CancellationToken.None);

        Assert.True(result.IsSuccess);
    }

    #endregion

    #region ChangeUsername Tests

    [Fact]
    public void ChangeUsernameValidator_Should_Pass_For_Valid_Data()
    {
        var validator = new ChangeUsernameCommandValidator();
        var command = new ChangeUsernameCommand("new_user-99", "Password123!");

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "Password123!", "New username is required.")]
    [InlineData("ab", "Password123!", "New username must be at least 3 characters long.")]
    [InlineData("invalid user name with spaces", "Password123!", "New username can only contain letters, numbers, underscores, and dashes.")]
    [InlineData("valid_name", "", "Current password is required.")]
    public void ChangeUsernameValidator_Should_Fail_For_Invalid_Data(string username, string password, string expectedError)
    {
        var validator = new ChangeUsernameCommandValidator();
        var command = new ChangeUsernameCommand(username, password);

        var result = validator.TestValidate(command);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public async Task ChangeUsernameHandler_Should_Fail_When_User_Not_Authenticated()
    {
        _currentUserServiceMock.Setup(x => x.UserId).Returns((string?)null);

        var handler = new ChangeUsernameCommandHandler(_identityServiceMock.Object, _currentUserServiceMock.Object);
        var result = await handler.Handle(new ChangeUsernameCommand("new_username", "Password123!"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.Unauthorized", result.Error.Code);
    }

    [Fact]
    public async Task ChangeUsernameHandler_Should_Succeed_When_Identity_Succeeds()
    {
        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _identityServiceMock
            .Setup(x => x.ChangeUsernameAsync("user-1", "new_username", "Password123!", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var handler = new ChangeUsernameCommandHandler(_identityServiceMock.Object, _currentUserServiceMock.Object);
        var result = await handler.Handle(new ChangeUsernameCommand("new_username", "Password123!"), CancellationToken.None);

        Assert.True(result.IsSuccess);
    }

    #endregion
}
