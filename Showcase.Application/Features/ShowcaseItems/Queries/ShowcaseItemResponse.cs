using System;
namespace Showcase.Application.Features.ShowcaseItems.Queries;

public record ShowcaseItemResponse(Guid Id, string Title, string Description, string? ImageUrl, string? LinkUrl, int DisplayOrder, bool IsFeatured);
