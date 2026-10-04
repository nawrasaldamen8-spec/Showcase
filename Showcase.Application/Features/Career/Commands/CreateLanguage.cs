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
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Common;

public record CreateLanguageCommand(
    string Language,
    string Proficiency) : IRequest<Result<CareerLanguageDto>>;

public class CreateLanguageCommandValidator : AbstractValidator<CreateLanguageCommand>
{
    public CreateLanguageCommandValidator()
    {
        RuleFor(x => x.Language)
            .NotEmpty().WithMessage("Language name is required.")
            .MaximumLength(100).WithMessage("Language name must not exceed 100 characters.");

        RuleFor(x => x.Proficiency)
            .NotEmpty().WithMessage("Proficiency level is required.");
    }
}

public class CreateLanguageCommandHandler : IRequestHandler<CreateLanguageCommand, Result<CareerLanguageDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public CreateLanguageCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerLanguageDto>> Handle(CreateLanguageCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerLanguageDto>(profileResult.Error);

        var profile = profileResult.Value;

        if (!Enum.TryParse<LanguageProficiency>(request.Proficiency, true, out var proficiency))
        {
            proficiency = LanguageProficiency.Intermediate;
        }

        var language = profile.AddLanguage(request.Language, proficiency);
        _context.Languages.Add(language);
        await _context.SaveChangesAsync(ct);

        return language.ToDto();
    }
}

