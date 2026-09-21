using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.DeletePost;

public record DeletePostCommand(Guid Id) : IRequest<Result>;
