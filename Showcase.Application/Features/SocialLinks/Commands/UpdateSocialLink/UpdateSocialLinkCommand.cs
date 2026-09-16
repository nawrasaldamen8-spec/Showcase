using MediatR;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;
using System;
namespace Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;

public record UpdateSocialLinkCommand(Guid Id, SocialPlatform Platform, string LinkUrl, int DisplayOrder) : IRequest<Result>;
