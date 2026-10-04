using System;
using System.Collections.Generic;
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

namespace Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Common;

public record UpdateExperienceCommand(
    Guid Id,
    string JobTitle,
    string Company,
    string StartDate,
    string? EndDate = null,
    bool CurrentlyWorking = false,
    string? Description = null,
    string? Achievements = null,
    string? EmploymentType = null,
    string? Location = null,
    IReadOnlyList<string>? SkillsUsed = null) : IRequest<Result<CareerExperienceDto>>;

public class UpdateExperienceCommandValidator : AbstractValidator<UpdateExperienceCommand>
{
    public UpdateExperienceCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Experience ID is required.");

        RuleFor(x => x.JobTitle)
            .NotEmpty().WithMessage("Job title is required.")
            .MaximumLength(150).WithMessage("Job title must not exceed 150 characters.");

        RuleFor(x => x.Company)
            .NotEmpty().WithMessage("Company name is required.")
            .MaximumLength(150).WithMessage("Company name must not exceed 150 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");
    }
}

public class UpdateExperienceCommandHandler : IRequestHandler<UpdateExperienceCommand, Result<CareerExperienceDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public UpdateExperienceCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerExperienceDto>> Handle(UpdateExperienceCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerExperienceDto>(profileResult.Error);

        var profile = profileResult.Value;

        var experience = await _context.Experiences.FirstOrDefaultAsync(e => e.Id == request.Id && e.ProfileId == profile.Id, ct);
        if (experience is null)
            return Error.NotFound("Experience.NotFound", $"Experience with ID '{request.Id}' was not found.");

        var endDate = request.CurrentlyWorking ? null : request.EndDate;
        var dateRangeResult = DateRange.Create(request.StartDate, endDate);
        if (dateRangeResult.IsFailure)
            return Result.Failure<CareerExperienceDto>(dateRangeResult.Error);

        experience.Update(
            request.JobTitle,
            request.Company,
            dateRangeResult.Value,
            request.Description,
            request.Achievements,
            request.EmploymentType,
            request.Location);

        if (request.SkillsUsed is not null)
        {
            experience.SetSkillsUsed(request.SkillsUsed);
        }

        await _context.SaveChangesAsync(ct);

        return experience.ToDto();
    }
}

