using System;
namespace Showcase.Application.Features.ContactMessages.Queries;

public record ContactMessageResponse(Guid Id, string Name, string Email, string Subject, string Message, DateTimeOffset CreatedAt, bool IsRead);
