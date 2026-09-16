using MediatR;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.ContactMessages.Queries;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.ContactMessages.Queries.GetContactMessages;

public record GetContactMessagesQuery(int PageNumber = 1, int PageSize = 10) : IRequest<Result<PaginatedList<ContactMessageResponse>>>;
