using MediatR;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.SocialLinks.Commands.AddSocialLink;

public record AddSocialLinkCommand(
    string Platform,
    string Url,
    int? DisplayOrder = null) : IRequest<Result<SocialLinkDto>>;
