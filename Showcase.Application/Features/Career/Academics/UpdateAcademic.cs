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

namespace Showcase.Application.Features.Career.Academics;

public record UpdateAcademicCommand(
    Guid Id,
    string Institution,
    string Degree,
    string FieldOfStudy,
    string StartDate,
    string? EndDate = null,
    bool CurrentlyStudying = false,
    string? Gpa = null,
    string? Achievements = null,
    string? Location = null,
    string? Description = null) : IRequest<Result<CareerAcademicDto>>;

public class UpdateAcademicCommandValidator : AbstractValidator<UpdateAcademicCommand>
{
    public UpdateAcademicCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Academic ID is required.");

        RuleFor(x => x.Institution)
            .NotEmpty().WithMessage("Institution name is required.")
            .MaximumLength(150).WithMessage("Institution must not exceed 150 characters.");

        RuleFor(x => x.Degree)
            .NotEmpty().WithMessage("Degree is required.")
            .MaximumLength(100).WithMessage("Degree must not exceed 100 characters.");

        RuleFor(x => x.FieldOfStudy)
            .NotEmpty().WithMessage("Field of study is required.")
            .MaximumLength(150).WithMessage("Field of study must not exceed 150 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");
    }
}

public class UpdateAcademicCommandHandler : IRequestHandler<UpdateAcademicCommand, Result<CareerAcademicDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public UpdateAcademicCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerAcademicDto>> Handle(UpdateAcademicCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerAcademicDto>(profileResult.Error);

        var profile = profileResult.Value;

        var academic = await _context.Academics.FirstOrDefaultAsync(a => a.Id == request.Id && a.ProfileId == profile.Id, ct);
        if (academic is null)
            return Error.NotFound("Academic.NotFound", $"Academic record with ID '{request.Id}' was not found.");

        var endDate = request.CurrentlyStudying ? null : request.EndDate;
        var dateRangeResult = DateRange.Create(request.StartDate, endDate);
        if (dateRangeResult.IsFailure)
            return Result.Failure<CareerAcademicDto>(dateRangeResult.Error);

        academic.Update(
            request.Institution,
            request.Degree,
            request.FieldOfStudy,
            dateRangeResult.Value,
            request.Gpa,
            request.Achievements,
            request.Location,
            request.Description);

        await _context.SaveChangesAsync(ct);

        return academic.ToDto();
    }
}
