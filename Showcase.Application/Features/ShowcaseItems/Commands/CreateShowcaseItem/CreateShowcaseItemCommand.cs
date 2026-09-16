using MediatR;
using Showcase.Domain.Common.Results;
using System;
namespace Showcase.Application.Features.ShowcaseItems.Commands.CreateShowcaseItem;

public record CreateShowcaseItemCommand(string Title, string Description, string? ImageUrl, string? LinkUrl, int DisplayOrder, bool IsFeatured) : IRequest<Result<Guid>>;
