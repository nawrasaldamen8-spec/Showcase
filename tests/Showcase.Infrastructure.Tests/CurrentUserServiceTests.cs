using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Showcase.Infrastructure.Identity;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class CurrentUserServiceTests
{
    private class FakeHttpContextAccessor : IHttpContextAccessor
    {
        public HttpContext? HttpContext { get; set; }
    }

    [Fact]
    public void WhenHttpContextIsNull_ShouldReturnNullAndFalse()
    {
        var accessor = new FakeHttpContextAccessor { HttpContext = null };
        var service = new CurrentUserService(accessor);

        Assert.Null(service.UserId);
        Assert.Null(service.Email);
        Assert.False(service.IsAuthenticated);
    }

    [Fact]
    public void WhenUserIsNotAuthenticated_ShouldReturnNullAndFalse()
    {
        var context = new DefaultHttpContext();
        var accessor = new FakeHttpContextAccessor { HttpContext = context };
        var service = new CurrentUserService(accessor);

        Assert.Null(service.UserId);
        Assert.Null(service.Email);
        Assert.False(service.IsAuthenticated);
    }

    [Fact]
    public void WhenUserIsAuthenticated_ShouldReturnUserIdAndEmail()
    {
        var context = new DefaultHttpContext();
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "user-456"),
            new(ClaimTypes.Email, "test@showcase.com")
        };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        context.User = new ClaimsPrincipal(identity);

        var accessor = new FakeHttpContextAccessor { HttpContext = context };
        var service = new CurrentUserService(accessor);

        Assert.Equal("user-456", service.UserId);
        Assert.Equal("test@showcase.com", service.Email);
        Assert.True(service.IsAuthenticated);
    }

    [Fact]
    public void WhenUserHasSubAndEmailClaims_ShouldResolveCorrectly()
    {
        var context = new DefaultHttpContext();
        var claims = new List<Claim>
        {
            new("sub", "sub-user-789"),
            new("email", "sub@showcase.com")
        };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        context.User = new ClaimsPrincipal(identity);

        var accessor = new FakeHttpContextAccessor { HttpContext = context };
        var service = new CurrentUserService(accessor);

        Assert.Equal("sub-user-789", service.UserId);
        Assert.Equal("sub@showcase.com", service.Email);
        Assert.True(service.IsAuthenticated);
    }

    [Fact]
    public void Constructor_WhenHttpContextAccessorIsNull_ShouldThrowArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => new CurrentUserService(null!));
    }

    [Fact]
    public void WhenUserIdClaimIsEmptyString_ShouldFallbackToSubClaim()
    {
        var context = new DefaultHttpContext();
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, ""),
            new("sub", "sub-from-fallback"),
            new(ClaimTypes.Email, "   "),
            new("email", "fallback@showcase.com")
        };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        context.User = new ClaimsPrincipal(identity);

        var accessor = new FakeHttpContextAccessor { HttpContext = context };
        var service = new CurrentUserService(accessor);

        Assert.Equal("sub-from-fallback", service.UserId);
        Assert.Equal("fallback@showcase.com", service.Email);
    }

    [Fact]
    public void WhenBothUserIdAndSubClaimsAreWhitespace_ShouldReturnNull()
    {
        var context = new DefaultHttpContext();
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, "   "),
            new("sub", ""),
            new(ClaimTypes.Email, ""),
            new("email", "   ")
        };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        context.User = new ClaimsPrincipal(identity);

        var accessor = new FakeHttpContextAccessor { HttpContext = context };
        var service = new CurrentUserService(accessor);

        Assert.Null(service.UserId);
        Assert.Null(service.Email);
    }
}
