using System;
using MediatR;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Queries.GetPostById;

public record GetPostByIdQuery(Guid Id) : IRequest<Result<PostResponse>>;
