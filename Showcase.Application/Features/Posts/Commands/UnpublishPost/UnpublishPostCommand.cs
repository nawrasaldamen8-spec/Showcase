using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.UnpublishPost;

public record UnpublishPostCommand(Guid Id) : IRequest<Result>;
