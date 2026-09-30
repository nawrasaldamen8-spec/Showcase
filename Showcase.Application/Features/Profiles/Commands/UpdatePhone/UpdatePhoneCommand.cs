using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.UpdatePhone;

public record UpdatePhoneCommand(string PhoneNumber) : IRequest<Result>;
