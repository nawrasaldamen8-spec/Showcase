using System;
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

public record CreateAcademicCommand(
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

public class CreateAcademicCommandValidator : AbstractValidator<CreateAcademicCommand>
{
    public CreateAcademicCommandValidator()
    {
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

public class CreateAcademicCommandHandler : IRequestHandler<CreateAcademicCommand, Result<CareerAcademicDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public CreateAcademicCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerAcademicDto>> Handle(CreateAcademicCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerAcademicDto>(profileResult.Error);

        var profile = profileResult.Value;

        var endDate = request.CurrentlyStudying ? null : request.EndDate;
        var dateRangeResult = DateRange.Create(request.StartDate, endDate);
        if (dateRangeResult.IsFailure)
            return Result.Failure<CareerAcademicDto>(dateRangeResult.Error);

        var academic = profile.AddAcademic(
            request.Institution,
            request.Degree,
            request.FieldOfStudy,
            dateRangeResult.Value,
            request.Gpa,
            request.Achievements);

        if (!string.IsNullOrWhiteSpace(request.Location) || !string.IsNullOrWhiteSpace(request.Description))
        {
            academic.Update(
                request.Institution,
                request.Degree,
                request.FieldOfStudy,
                dateRangeResult.Value,
                request.Gpa,
                request.Achievements,
                request.Location,
                request.Description);
        }

        _context.Academics.Add(academic);
        await _context.SaveChangesAsync(ct);

        return academic.ToDto();
    }
}
