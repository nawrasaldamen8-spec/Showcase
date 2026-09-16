using MediatR;
using Showcase.Domain.Common.Results;
using System;
namespace Showcase.Application.Features.ShowcaseItems.Commands.UpdateShowcaseItem;

public record UpdateShowcaseItemCommand(Guid Id, string Title, string Description, string? ImageUrl, string? LinkUrl, int DisplayOrder, bool IsFeatured) : IRequest<Result>;
