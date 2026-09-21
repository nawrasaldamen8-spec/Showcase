using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.SocialLinks.Commands.DeleteSocialLink;

public record DeleteSocialLinkCommand(Guid Id) : IRequest<Result>;
