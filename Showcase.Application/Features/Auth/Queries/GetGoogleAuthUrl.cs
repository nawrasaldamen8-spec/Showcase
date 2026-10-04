using MediatR;
using Microsoft.Extensions.Options;
using Showcase.Application.Common.Models;
using Showcase.Domain.Common.Results;
using System;
using System.Text.Encodings.Web;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.Auth.Queries;



public record GoogleAuthUrlResponse(string Url);

public record GetGoogleAuthUrlQuery(string? ReturnUrl = null) : IRequest<Result<GoogleAuthUrlResponse>>;

public class GetGoogleAuthUrlQueryHandler : IRequestHandler<GetGoogleAuthUrlQuery, Result<GoogleAuthUrlResponse>>
{
    private readonly IOptions<GoogleAuthSettings> _googleOptions;

    public GetGoogleAuthUrlQueryHandler(IOptions<GoogleAuthSettings> googleOptions)
    {
        _googleOptions = googleOptions;
    }

    public Task<Result<GoogleAuthUrlResponse>> Handle(GetGoogleAuthUrlQuery request, CancellationToken ct)
    {
        var options = _googleOptions.Value;
        if (string.IsNullOrWhiteSpace(options.ClientId))
        {
            return Task.FromResult(Result.Failure<GoogleAuthUrlResponse>(
                Error.Failure("Auth.GoogleNotConfigured", "Google authentication is not configured.")));
        }

        var redirectUri = UrlEncoder.Default.Encode(options.RedirectUri);
        var state = UrlEncoder.Default.Encode(string.IsNullOrWhiteSpace(request.ReturnUrl) ? "/feed" : request.ReturnUrl);

        var url = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                  $"client_id={options.ClientId}&" +
                  $"redirect_uri={redirectUri}&" +
                  $"response_type=code&" +
                  $"scope=openid%20email%20profile&" +
                  $"access_type=offline&" +
                  $"prompt=consent&" +
                  $"state={state}";

        return Task.FromResult(Result.Success(new GoogleAuthUrlResponse(url)));
    }
}

