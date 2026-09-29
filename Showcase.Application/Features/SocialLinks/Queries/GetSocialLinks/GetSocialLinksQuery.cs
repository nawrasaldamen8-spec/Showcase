using System.Collections.Generic;
using MediatR;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.SocialLinks.Queries.GetSocialLinks;

public record GetSocialLinksQuery : IRequest<Result<IReadOnlyList<SocialLinkDto>>>;
