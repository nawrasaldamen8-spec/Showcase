using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.SocialLinks.Commands.UpdateSocialLink;

public record UpdateSocialLinkCommand(
    Guid Id,
    string Platform,
    string Url) : IRequest<Result>;
