using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Broadcasts;

public record CreateBroadcastCommand(
    string Title,
    string Message,
    string Severity = "info",
    DateTime? ExpiresAt = null) : IRequest<Result>;

public class CreateBroadcastCommandValidator : AbstractValidator<CreateBroadcastCommand>
{
    public CreateBroadcastCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Broadcast title is required.")
            .MaximumLength(150).WithMessage("Title must not exceed 150 characters.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Broadcast message is required.")
            .MaximumLength(1000).WithMessage("Message must not exceed 1000 characters.");
    }
}

public class CreateBroadcastCommandHandler : IRequestHandler<CreateBroadcastCommand, Result>
{
    public Task<Result> Handle(CreateBroadcastCommand request, CancellationToken ct)
    {
        return Task.FromResult(Result.Success());
    }
}
