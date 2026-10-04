using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Posts.Common;

public static class PostTaggingExtensions
{
    public static async Task AttachTagsAsync(
        this Post post,
        IApplicationDbContext context,
        IEnumerable<string>? rawTags,
        CancellationToken ct = default)
    {
        if (rawTags is null) return;

        var cleanedTags = rawTags
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => (Raw: t.Trim(), Normalized: Tag.NormalizeTag(t)))
            .Where(t => !string.IsNullOrEmpty(t.Normalized))
            .GroupBy(t => t.Normalized)
            .Select(g => g.First())
            .ToList();

        if (cleanedTags.Count == 0) return;

        var normalizedNames = cleanedTags.Select(t => t.Normalized).ToList();
        var existingTags = await context.Tags
            .Where(t => normalizedNames.Contains(t.NormalizedName))
            .ToListAsync(ct);

        var existingMap = existingTags.ToDictionary(t => t.NormalizedName, t => t);

        foreach (var (raw, normalized) in cleanedTags)
        {
            if (!existingMap.TryGetValue(normalized, out var tag))
            {
                tag = new Tag(raw);
                context.Tags.Add(tag);
                existingMap[normalized] = tag;
            }

            post.AddTag(tag.Id);
        }
    }
}
