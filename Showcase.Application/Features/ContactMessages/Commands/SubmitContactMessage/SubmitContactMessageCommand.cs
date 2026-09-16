using MediatR;
using Showcase.Domain.Common.Results;
using System;
namespace Showcase.Application.Features.ContactMessages.Commands.SubmitContactMessage;

public record SubmitContactMessageCommand(string Name, string Email, string Subject, string Message) : IRequest<Result<Guid>>;
