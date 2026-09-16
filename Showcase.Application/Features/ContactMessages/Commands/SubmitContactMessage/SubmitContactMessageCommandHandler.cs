using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.ContactMessage;
using Showcase.Domain.ValueObjects;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ContactMessages.Commands.SubmitContactMessage;

public class SubmitContactMessageCommandHandler : IRequestHandler<SubmitContactMessageCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    public SubmitContactMessageCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<Guid>> Handle(SubmitContactMessageCommand request, CancellationToken ct)
    {
        var emailRes = Email.Create(request.Email);
        if (emailRes.IsFailure) return emailRes.Error;

        var message = new ContactMessage(request.Name, emailRes.Value, request.Subject, request.Message);
        _context.Set<ContactMessage>().Add(message);
        await _context.SaveChangesAsync(ct);
        
        return message.Id;
    }
}
