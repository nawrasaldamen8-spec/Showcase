using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Application.Features.Career.Achievements;

public record UpdateAchievementCommand(
    Guid Id,
    string Title,
    string? Type = null,
    string? Organization = null,
    string? Date = null,
    string? Url = null,
    string? MediaUrl = null,
    string? Description = null) : IRequest<Result<CareerAchievementDto>>;

public class UpdateAchievementCommandValidator : AbstractValidator<UpdateAchievementCommand>
{
    public UpdateAchievementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Achievement ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Achievement title is required.")
            .MaximumLength(150).WithMessage("Title must not exceed 150 characters.");
    }
}

public class UpdateAchievementCommandHandler : IRequestHandler<UpdateAchievementCommand, Result<CareerAchievementDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public UpdateAchievementCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerAchievementDto>> Handle(UpdateAchievementCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerAchievementDto>(profileResult.Error);

        var profile = profileResult.Value;

        var achievement = await _context.Achievements.FirstOrDefaultAsync(a => a.Id == request.Id && a.ProfileId == profile.Id, ct);
        if (achievement is null)
            return Error.NotFound("Achievement.NotFound", $"Achievement record with ID '{request.Id}' was not found.");

        Url? url = null;
        if (!string.IsNullOrWhiteSpace(request.Url))
        {
            var urlResult = Url.Create(request.Url);
            if (urlResult.IsFailure)
                return Result.Failure<CareerAchievementDto>(urlResult.Error);
            url = urlResult.Value;
        }

        StorageKey? mediaKey = null;
        if (!string.IsNullOrWhiteSpace(request.MediaUrl))
        {
            var keyResult = StorageKey.Create(request.MediaUrl);
            if (keyResult.IsSuccess)
                mediaKey = keyResult.Value;
        }

        achievement.Update(
            request.Title,
            request.Type,
            request.Organization,
            request.Date,
            url,
            mediaKey,
            request.Description);

        await _context.SaveChangesAsync(ct);

        return achievement.ToDto();
    }
}
