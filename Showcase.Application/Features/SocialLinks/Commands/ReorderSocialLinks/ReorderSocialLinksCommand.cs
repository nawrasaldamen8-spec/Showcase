using System;
using System.Collections.Generic;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.SocialLinks.Commands.ReorderSocialLinks;

public record ReorderSocialLinkItem(Guid Id, int DisplayOrder);

public record ReorderSocialLinksCommand(IReadOnlyList<ReorderSocialLinkItem> Items) : IRequest<Result>;
