using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Users;

public record UpdateUserRoleCommand(
    string UserId,
    IReadOnlyList<string> Roles) : IRequest<Result>;

public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand>
{
    public UpdateUserRoleCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Roles)
            .NotNull().WithMessage("Roles list cannot be null.");
    }
}

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, Result>
{
    public Task<Result> Handle(UpdateUserRoleCommand request, CancellationToken ct)
    {
        return Task.FromResult(Result.Success());
    }
}
