using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.PublishPost;

public record PublishPostCommand(Guid Id) : IRequest<Result>;
