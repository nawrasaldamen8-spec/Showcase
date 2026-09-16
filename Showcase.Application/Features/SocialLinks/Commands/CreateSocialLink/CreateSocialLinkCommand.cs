using MediatR;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;
using System;
namespace Showcase.Application.Features.SocialLinks.Commands.CreateSocialLink;

public record CreateSocialLinkCommand(Guid ProfileId, SocialPlatform Platform, string LinkUrl, int DisplayOrder) : IRequest<Result<Guid>>;
