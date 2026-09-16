using System;
namespace Showcase.Application.Features.Profile.Queries.GetPublicProfile;

public record ProfileResponse(Guid Id, string Name, string Title, string Bio, string? ProfileImageUrl, string Location);
