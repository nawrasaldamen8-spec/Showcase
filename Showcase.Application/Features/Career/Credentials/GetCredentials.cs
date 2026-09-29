using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Credentials;

public record GetCredentialsQuery : IRequest<Result<IReadOnlyList<CareerCredentialDto>>>;

public class GetCredentialsQueryHandler : IRequestHandler<GetCredentialsQuery, Result<IReadOnlyList<CareerCredentialDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetCredentialsQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CareerCredentialDto>>> Handle(GetCredentialsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerCredentialDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Credentials
            .Where(c => c.ProfileId == profile.Id)
            .OrderByDescending(c => c.Validity.Start)
            .ToListAsync(ct);

        return list.Select(c => c.ToDto()).ToList();
    }
}
