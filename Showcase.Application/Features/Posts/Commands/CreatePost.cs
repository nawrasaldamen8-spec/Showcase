using FluentValidation;
using MediatR;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Posts.Commands;



public record CreatePostCommand(
    string Title,
    string Description = "",
    string? ExternalUrl = null,
    IReadOnlyList<string>? Tags = null) : IRequest<Result<PostCreatedResponse>>;



public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, Result<PostCreatedResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreatePostCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PostCreatedResponse>> Handle(CreatePostCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
        {
            return Result.Failure<PostCreatedResponse>(profileResult.Error);
        }

        var urlResult = Url.CreateOptional(request.ExternalUrl);
        if (urlResult.IsFailure)
        {
            return Result.Failure<PostCreatedResponse>(urlResult.Error);
        }

        var post = new Post(profileResult.Value.Id, request.Title, request.Description, urlResult.Value);

        await post.AttachTagsAsync(_context, request.Tags, ct);

        _context.Posts.Add(post);
        await _context.SaveChangesAsync(ct);

        return new PostCreatedResponse(post.Id);
    }
}



public class CreatePostCommandValidator : AbstractValidator<CreatePostCommand>
{
    public CreatePostCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(4000).WithMessage("Description cannot exceed 4000 characters.");

        RuleFor(x => x.ExternalUrl)
            .MaximumLength(Url.MaxLength).WithMessage($"External URL cannot exceed {Url.MaxLength} characters.")
            .Must(BeAValidHttpUrl).WithMessage("External URL must be a valid HTTP or HTTPS URL.")
            .When(x => !string.IsNullOrWhiteSpace(x.ExternalUrl));
    }

    private static bool BeAValidHttpUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
               (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

