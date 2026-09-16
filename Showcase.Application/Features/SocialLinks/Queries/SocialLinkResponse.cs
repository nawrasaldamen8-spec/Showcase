using Showcase.Domain.Enums;
using System;
namespace Showcase.Application.Features.SocialLinks.Queries;

public record SocialLinkResponse(Guid Id, SocialPlatform Platform, string LinkUrl, int DisplayOrder);
