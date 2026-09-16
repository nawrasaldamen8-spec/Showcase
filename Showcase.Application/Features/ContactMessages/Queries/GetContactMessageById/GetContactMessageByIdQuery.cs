using MediatR;
using Showcase.Domain.Common.Results;
using Showcase.Application.Features.ContactMessages.Queries;
using System;
namespace Showcase.Application.Features.ContactMessages.Queries.GetContactMessageById;

public record GetContactMessageByIdQuery(Guid Id) : IRequest<Result<ContactMessageResponse>>;
