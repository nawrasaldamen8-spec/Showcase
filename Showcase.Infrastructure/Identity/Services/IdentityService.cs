using Microsoft.AspNetCore.Identity;
using Showcase.Infrastructure.Data;

namespace Showcase.Infrastructure.Identity;

public partial class IdentityService(UserManager<ApplicationUser> userManager, ApplicationDbContext context) : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly ApplicationDbContext _context = context;

    /// <summary>Keeps the null email intact instead of coercing it to an empty string, which lost the distinction.</summary>
    private static UserIdentityDetails ToDetails(ApplicationUser user, IList<string> roles) =>
        new(user.Id, user.Email, user.UserName ?? string.Empty, roles);

    private static bool LooksLikeEmail(string value) =>
        value.Contains('@', StringComparison.Ordinal) && value.Contains('.', StringComparison.Ordinal);
}
