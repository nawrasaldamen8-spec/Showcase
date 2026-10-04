using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Storage.Commands.UploadLocalFile;

public record UploadLocalFileResponse(bool Success, string Key);

public record UploadLocalFileCommand(string Key, Stream ContentStream) : IRequest<Result<UploadLocalFileResponse>>;

public class UploadLocalFileCommandHandler : IRequestHandler<UploadLocalFileCommand, Result<UploadLocalFileResponse>>
{
    private readonly IStorageService _storageService;

    public UploadLocalFileCommandHandler(IStorageService storageService)
    {
        _storageService = storageService;
    }

    public async Task<Result<UploadLocalFileResponse>> Handle(UploadLocalFileCommand request, CancellationToken ct)
    {
        var saveResult = await _storageService.SaveAsync(request.Key, request.ContentStream, ct);
        if (saveResult.IsFailure)
        {
            return Result.Failure<UploadLocalFileResponse>(saveResult.Error);
        }

        return new UploadLocalFileResponse(true, saveResult.Value);
    }
}
