using Moq;
using Showcase.Application.Features.Auth.Commands;
using Showcase.Application.Features.Auth.Queries;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class AuthFeatureTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    #region Validator Tests

    [Fact]
    public void RegisterCommandValidator_Should_Pass_For_Valid_Data()
    {
        var validator = new RegisterCommandValidator();
        var command = new RegisterCommand("valid_user-1", "SecurePass123!", "John Doe", "user@test.com");

        var result = validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("not-an-email", "Email must be a valid email address.")]
    [InlineData("invalid@char", "Email must be a valid email address.")]
    public void RegisterCommandValidator_Should_Fail_For_Invalid_Email(string email, string expectedError)
    {
        var validator = new RegisterCommandValidator();
        var command = new RegisterCommand("valid_user", "SecurePass123!", "John Doe", email);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Email)
            .WithErrorMessage(expectedError);
    }

    [Theory]
    [InlineData("ab", "Username must be between 3 and 30 characters.")]
    [InlineData("user with spaces", "Username can only contain alphanumeric characters, underscores, and hyphens.")]
    [InlineData("invalid@char", "Username can only contain alphanumeric characters, underscores, and hyphens.")]
    public void RegisterCommandValidator_Should_Fail_For_Invalid_Username(string username, string expectedError)
    {
        var validator = new RegisterCommandValidator();
        var command = new RegisterCommand(username, "SecurePass123!", "John Doe", "test@email.com");

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage(expectedError);
    }

    [Fact]
    public void LoginCommandValidator_Should_Fail_When_Fields_Empty()
    {
        var validator = new LoginCommandValidator();
        var command = new LoginCommand("", "");

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.EmailOrUsername);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void RefreshTokenCommandValidator_Should_Fail_When_Tokens_Empty()
    {
        var validator = new RefreshTokenCommandValidator();
        var command = new RefreshTokenCommand(null, "");

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.RefreshToken);
    }

    #endregion

    #region Register Command Handler Tests

    [Fact]
    public async Task RegisterCommandHandler_Should_Create_User_And_Profile_And_Return_Tokens()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var mockIdentity = new Mock<IIdentityService>();
        var mockTokenService = new Mock<ITokenService>();

        const string userId = "user-123";
        const string accessToken = "valid-access-token";
        const string refreshToken = "valid-refresh-token";

        mockIdentity.Setup(i => i.RegisterUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(userId));

        mockTokenService.Setup(t => t.GenerateAccessToken(userId, "testuser", "test@test.com", It.IsAny<IList<string>>()))
            .Returns(accessToken);

        mockTokenService.Setup(t => t.GenerateRefreshToken())
            .Returns(refreshToken);

        mockIdentity.Setup(i => i.UpdateRefreshTokenAsync(
                userId, refreshToken, It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var orchestrator = new Showcase.Infrastructure.Identity.AuthSessionOrchestrator(mockIdentity.Object, mockTokenService.Object);
        var handler = new RegisterCommandHandler(mockIdentity.Object, context, orchestrator);
        var command = new RegisterCommand("testuser", "Password123!", "John Doe", "test@test.com");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(accessToken, result.Value.AccessToken);
        Assert.Equal(refreshToken, result.Value.RefreshToken);

        var profile = await context.Set<Profile>().FirstOrDefaultAsync(p => p.UserId == userId);
        Assert.NotNull(profile);
        Assert.Equal("John Doe", profile.Name);
    }

    [Fact]
    public async Task RegisterCommandHandler_Should_Return_Error_When_Email_Taken()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var mockIdentity = new Mock<IIdentityService>();
        var mockTokenService = new Mock<ITokenService>();

        mockIdentity.Setup(i => i.RegisterUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Error.Conflict("Auth.EmailTaken", "Email is already registered."));

        var orchestrator = new Showcase.Infrastructure.Identity.AuthSessionOrchestrator(mockIdentity.Object, mockTokenService.Object);
        var handler = new RegisterCommandHandler(mockIdentity.Object, context, orchestrator);
        var command = new RegisterCommand("testuser", "Password123!", "John Doe", "duplicate@test.com");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Auth.EmailTaken", result.Error.Code);
    }

    #endregion

    #region Login Command Handler Tests

    [Fact]
    public async Task LoginCommandHandler_Should_Return_Tokens_On_Valid_Credentials()
    {
        // Arrange
        var mockIdentity = new Mock<IIdentityService>();
        var mockTokenService = new Mock<ITokenService>();

        const string userId = "user-123";
        var userDetails = new UserIdentityDetails(userId, "test@test.com", "testuser", new List<string>());

        mockIdentity.Setup(i => i.AuthenticateAsync("test@test.com", "Password123!", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(userDetails));

        mockTokenService.Setup(t => t.GenerateAccessToken(userId, "testuser", "test@test.com", It.IsAny<IList<string>>()))
            .Returns("access-token-123");

        mockTokenService.Setup(t => t.GenerateRefreshToken())
            .Returns("refresh-token-123");

        mockIdentity.Setup(i => i.UpdateRefreshTokenAsync(
                userId, "refresh-token-123", It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var orchestrator = new Showcase.Infrastructure.Identity.AuthSessionOrchestrator(mockIdentity.Object, mockTokenService.Object);
        var handler = new LoginCommandHandler(mockIdentity.Object, orchestrator);
        var command = new LoginCommand("test@test.com", "Password123!");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("access-token-123", result.Value.AccessToken);
        Assert.Equal("refresh-token-123", result.Value.RefreshToken);
    }

    [Fact]
    public async Task LoginCommandHandler_Should_Return_Unauthorized_On_Invalid_Credentials()
    {
        // Arrange
        var mockIdentity = new Mock<IIdentityService>();
        var mockTokenService = new Mock<ITokenService>();

        mockIdentity.Setup(i => i.AuthenticateAsync("test@test.com", "WrongPassword", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Error.Unauthorized("Auth.InvalidCredentials", "Invalid credentials."));

        var orchestrator = new Showcase.Infrastructure.Identity.AuthSessionOrchestrator(mockIdentity.Object, mockTokenService.Object);
        var handler = new LoginCommandHandler(mockIdentity.Object, orchestrator);
        var command = new LoginCommand("test@test.com", "WrongPassword");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidCredentials", result.Error.Code);
    }

    #endregion

    #region Refresh Token Command Handler Tests

    [Fact]
    public async Task RefreshTokenCommandHandler_Should_Rotate_Tokens_On_Valid_Request()
    {
        // Arrange
        var mockIdentity = new Mock<IIdentityService>();
        var mockTokenService = new Mock<ITokenService>();

        const string userId = "user-123";
        var userDetails = new UserIdentityDetails(userId, "test@test.com", "testuser", new List<string>());

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        mockTokenService.Setup(t => t.GetPrincipalFromExpiredToken("expired-access-token"))
            .Returns(principal);

        mockIdentity.Setup(i => i.ValidateRefreshTokenAsync(userId, "valid-refresh-token", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(userDetails));

        mockTokenService.Setup(t => t.GenerateAccessToken(userId, "testuser", "test@test.com", It.IsAny<IList<string>>()))
            .Returns("new-access-token");

        mockTokenService.Setup(t => t.GenerateRefreshToken())
            .Returns("new-refresh-token");

        mockIdentity.Setup(i => i.UpdateRefreshTokenAsync(
                userId, "new-refresh-token", It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var orchestrator = new Showcase.Infrastructure.Identity.AuthSessionOrchestrator(mockIdentity.Object, mockTokenService.Object);
        var handler = new RefreshTokenCommandHandler(orchestrator);
        var command = new RefreshTokenCommand("expired-access-token", "valid-refresh-token");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("new-access-token", result.Value.AccessToken);
        Assert.Equal("new-refresh-token", result.Value.RefreshToken);
    }

    [Fact]
    public async Task RefreshTokenCommandHandler_Should_Fail_When_AccessToken_Invalid()
    {
        // Arrange
        var mockIdentity = new Mock<IIdentityService>();
        var mockTokenService = new Mock<ITokenService>();

        mockTokenService.Setup(t => t.GetPrincipalFromExpiredToken("malformed-token"))
            .Returns((ClaimsPrincipal?)null);

        var orchestrator = new Showcase.Infrastructure.Identity.AuthSessionOrchestrator(mockIdentity.Object, mockTokenService.Object);
        var handler = new RefreshTokenCommandHandler(orchestrator);
        var command = new RefreshTokenCommand("malformed-token", "some-refresh-token");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Auth.InvalidToken", result.Error.Code);
    }

    #endregion

    #region GetCurrentUser Query Handler Tests

    [Fact]
    public async Task GetCurrentUserQueryHandler_Should_Return_User_And_Profile_Details()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var mockCurrentUser = new Mock<ICurrentUserService>();
        var mockIdentity = new Mock<IIdentityService>();
        var mockStorage = new Mock<IStorageService>();

        const string userId = "user-123";
        mockCurrentUser.Setup(c => c.UserId).Returns(userId);

        var userDetails = new UserIdentityDetails(userId, "test@test.com", "creator_one", new List<string> { "User" });
        mockIdentity.Setup(i => i.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(userDetails));

        var profile = new Profile(userId, "Jane Doe");
        context.Set<Profile>().Add(profile);
        await context.SaveChangesAsync();

        var handler = new GetCurrentUserQueryHandler(
            mockCurrentUser.Object,
            mockIdentity.Object,
            context,
            mockStorage.Object);

        // Act
        var result = await handler.Handle(new GetCurrentUserQuery(), CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(userId, result.Value.Id);
        Assert.Equal("test@test.com", result.Value.Email);
        Assert.Equal("creator_one", result.Value.Username);
        Assert.Equal("Jane Doe", result.Value.Name);
        Assert.Equal(profile.Id, result.Value.ProfileId);
    }

    [Fact]
    public async Task GetCurrentUserQueryHandler_Should_Return_Unauthorized_When_User_Not_Logged_In()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var mockCurrentUser = new Mock<ICurrentUserService>();
        var mockIdentity = new Mock<IIdentityService>();
        var mockStorage = new Mock<IStorageService>();

        mockCurrentUser.Setup(c => c.UserId).Returns((string?)null);

        var handler = new GetCurrentUserQueryHandler(
            mockCurrentUser.Object,
            mockIdentity.Object,
            context,
            mockStorage.Object);

        // Act
        var result = await handler.Handle(new GetCurrentUserQuery(), CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Auth.Unauthenticated", result.Error.Code);
    }

    [Fact]
    public async Task LogoutCommandHandler_Should_Revoke_Token_When_User_Is_Authenticated()
    {
        // Arrange
        var mockCurrentUser = new Mock<ICurrentUserService>();
        var mockIdentity = new Mock<IIdentityService>();

        const string userId = "user-to-logout-123";
        mockCurrentUser.Setup(c => c.UserId).Returns(userId);
        mockIdentity.Setup(i => i.RevokeRefreshTokenAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var handler = new LogoutCommandHandler(mockIdentity.Object, mockCurrentUser.Object);

        // Act
        var result = await handler.Handle(new LogoutCommand(), CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        mockIdentity.Verify(i => i.RevokeRefreshTokenAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LogoutCommandHandler_Should_Return_Unauthorized_When_User_Not_Authenticated()
    {
        // Arrange
        var mockCurrentUser = new Mock<ICurrentUserService>();
        var mockIdentity = new Mock<IIdentityService>();

        mockCurrentUser.Setup(c => c.UserId).Returns((string?)null);

        var handler = new LogoutCommandHandler(mockIdentity.Object, mockCurrentUser.Object);

        // Act
        var result = await handler.Handle(new LogoutCommand(), CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("Auth.Unauthorized", result.Error.Code);
        mockIdentity.Verify(i => i.RevokeRefreshTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region AuthSessionOrchestrator Tests

    [Fact]
    public async Task AuthSessionOrchestrator_CreateSessionAsync_Should_Set_Cookies_And_Return_Tokens()
    {
        // Arrange
        var mockIdentity = new Mock<IIdentityService>();
        var mockTokenService = new Mock<ITokenService>();
        var mockCookieService = new Mock<IAuthCookieService>();

        const string userId = "u-456";
        var user = new UserIdentityDetails(userId, "orchestrator@test.com", "orchUser", new List<string> { "User" });

        mockTokenService.Setup(t => t.GenerateAccessToken(userId, "orchUser", "orchestrator@test.com", It.IsAny<IList<string>>()))
            .Returns("access-jwt");
        mockTokenService.Setup(t => t.GenerateRefreshToken())
            .Returns("refresh-jwt");
        mockIdentity.Setup(i => i.UpdateRefreshTokenAsync(userId, "refresh-jwt", It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var orchestrator = new Showcase.Infrastructure.Identity.AuthSessionOrchestrator(
            mockIdentity.Object,
            mockTokenService.Object,
            mockCookieService.Object);

        // Act
        var result = await orchestrator.CreateSessionAsync(user, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("access-jwt", result.Value.AccessToken);
        Assert.Equal("refresh-jwt", result.Value.RefreshToken);
        mockCookieService.Verify(c => c.SetAuthCookies("access-jwt", "refresh-jwt"), Times.Once);
    }

    [Fact]
    public async Task AuthSessionOrchestrator_RefreshSessionAsync_Should_Work_With_Direct_RefreshToken()
    {
        // Arrange
        var mockIdentity = new Mock<IIdentityService>();
        var mockTokenService = new Mock<ITokenService>();
        var mockCookieService = new Mock<IAuthCookieService>();

        const string userId = "u-789";
        var user = new UserIdentityDetails(userId, "direct@test.com", "directUser", new List<string>());

        mockIdentity.Setup(i => i.ValidateRefreshTokenDirectAsync("direct-refresh-token", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(user));
        mockTokenService.Setup(t => t.GenerateAccessToken(userId, "directUser", "direct@test.com", It.IsAny<IList<string>>()))
            .Returns("new-access");
        mockTokenService.Setup(t => t.GenerateRefreshToken())
            .Returns("new-refresh");
        mockIdentity.Setup(i => i.UpdateRefreshTokenAsync(userId, "new-refresh", It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success());

        var orchestrator = new Showcase.Infrastructure.Identity.AuthSessionOrchestrator(
            mockIdentity.Object,
            mockTokenService.Object,
            mockCookieService.Object);

        // Act
        var result = await orchestrator.RefreshSessionAsync(null, "direct-refresh-token", CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("new-access", result.Value.AccessToken);
        Assert.Equal("new-refresh", result.Value.RefreshToken);
    }

    #endregion
}

