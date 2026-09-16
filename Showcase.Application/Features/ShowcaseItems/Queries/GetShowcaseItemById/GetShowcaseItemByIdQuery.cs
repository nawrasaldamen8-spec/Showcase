using MediatR;
using Showcase.Domain.Common.Results;
using Showcase.Application.Features.ShowcaseItems.Queries;
using System;
namespace Showcase.Application.Features.ShowcaseItems.Queries.GetShowcaseItemById;

public record GetShowcaseItemByIdQuery(Guid Id) : IRequest<Result<ShowcaseItemResponse>>;
