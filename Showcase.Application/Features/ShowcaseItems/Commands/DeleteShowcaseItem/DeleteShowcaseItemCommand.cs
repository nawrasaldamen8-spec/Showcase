using MediatR;
using Showcase.Domain.Common.Results;
using System;
namespace Showcase.Application.Features.ShowcaseItems.Commands.DeleteShowcaseItem;

public record DeleteShowcaseItemCommand(Guid Id) : IRequest<Result>;
