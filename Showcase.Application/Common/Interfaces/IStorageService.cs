using System;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Common.Interfaces;

public interface IStorageService
{
    Task<string> GetPresignedUploadUrlAsync(string storageKey, string contentType, TimeSpan expiresIn, CancellationToken ct = default);
    string GetPublicUrl(string storageKey);
    Task DeleteAsync(string storageKey, CancellationToken ct = default);
}
