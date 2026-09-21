using MediatR;
using Showcase.Application.Features.Profiles.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.GetAvatarUploadUrl;

public record GetAvatarUploadUrlCommand(
    string ContentType,
    long FileSizeBytes) : IRequest<Result<AvatarUploadUrlResponse>>;
