using MediatR;
using Showcase.Domain.Common.Results;
using System;
namespace Showcase.Application.Features.ContactMessages.Commands.MarkContactMessageAsRead;

public record MarkContactMessageAsReadCommand(Guid Id) : IRequest<Result>;
