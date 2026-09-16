using MediatR;
using Showcase.Domain.Common.Results;
using Showcase.Application.Features.ContactMessages.Queries;
using System.Collections.Generic;
namespace Showcase.Application.Features.ContactMessages.Queries.GetContactMessages;

public record GetContactMessagesQuery : IRequest<Result<List<ContactMessageResponse>>>;
