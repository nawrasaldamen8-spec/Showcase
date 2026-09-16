using MediatR;
using Showcase.Domain.Common.Results;
using System.Collections.Generic;
namespace Showcase.Application.Features.ShowcaseItems.Queries.GetShowcaseItems;

public record GetShowcaseItemsQuery : IRequest<Result<List<ShowcaseItemResponse>>>;
