using MediatR;
using Showcase.Domain.Common.Results;
using System;
namespace Showcase.Application.Features.ContactMessages.Commands.DeleteContactMessage;

public record DeleteContactMessageCommand(Guid Id) : IRequest<Result>;
