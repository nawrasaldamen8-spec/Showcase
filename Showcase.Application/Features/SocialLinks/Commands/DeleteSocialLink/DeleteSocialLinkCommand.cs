using MediatR;
using Showcase.Domain.Common.Results;
using System;
namespace Showcase.Application.Features.SocialLinks.Commands.DeleteSocialLink;

public record DeleteSocialLinkCommand(Guid Id) : IRequest<Result>;
