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
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Common;

public record UpdateLanguageCommand(
    Guid Id,
    string Language,
    string Proficiency) : IRequest<Result<CareerLanguageDto>>;

public class UpdateLanguageCommandValidator : AbstractValidator<UpdateLanguageCommand>
{
    public UpdateLanguageCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Language ID is required.");

        RuleFor(x => x.Language)
            .NotEmpty().WithMessage("Language name is required.")
            .MaximumLength(100).WithMessage("Language name must not exceed 100 characters.");

        RuleFor(x => x.Proficiency)
            .NotEmpty().WithMessage("Proficiency level is required.");
    }
}

public class UpdateLanguageCommandHandler : IRequestHandler<UpdateLanguageCommand, Result<CareerLanguageDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public UpdateLanguageCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerLanguageDto>> Handle(UpdateLanguageCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerLanguageDto>(profileResult.Error);

        var profile = profileResult.Value;

        var language = await _context.Languages.FirstOrDefaultAsync(l => l.Id == request.Id && l.ProfileId == profile.Id, ct);
        if (language is null)
            return Error.NotFound("Language.NotFound", $"Language record with ID '{request.Id}' was not found.");

        if (!Enum.TryParse<LanguageProficiency>(request.Proficiency, true, out var proficiency))
        {
            proficiency = LanguageProficiency.Intermediate;
        }

        language.Update(request.Language, proficiency);
        await _context.SaveChangesAsync(ct);

        return language.ToDto();
    }
}

