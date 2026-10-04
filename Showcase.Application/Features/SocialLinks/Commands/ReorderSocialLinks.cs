using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.SocialLinks.Commands;



public record ReorderSocialLinkItem(Guid Id, int DisplayOrder);

public record ReorderSocialLinksCommand(IReadOnlyList<ReorderSocialLinkItem> Items) : IRequest<Result>;



public class ReorderSocialLinksCommandHandler : IRequestHandler<ReorderSocialLinksCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ReorderSocialLinksCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result> Handle(ReorderSocialLinksCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var dictionary = request.Items.ToDictionary(x => x.Id, x => x.DisplayOrder);
        profile.ReorderSocialLinks(dictionary);

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}



public class ReorderSocialLinksCommandValidator : AbstractValidator<ReorderSocialLinksCommand>
{
    public ReorderSocialLinksCommandValidator()
    {
        RuleFor(x => x.Items)
            .NotNull().WithMessage("Items list is required.")
            .NotEmpty().WithMessage("At least one social link item must be provided.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.Id)
                .NotEmpty().WithMessage("Social link ID is required.");

            item.RuleFor(i => i.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative.");
        });
    }
}

