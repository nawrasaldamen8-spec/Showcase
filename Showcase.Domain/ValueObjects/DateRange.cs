namespace Showcase.Domain.ValueObjects;

/// <summary>
/// Spans a start date and an optional end date. A null <see cref="End"/> means the span is still open,
/// which is the only source of truth for <see cref="IsCurrent"/> so the flag can never contradict the dates.
/// </summary>
public sealed record DateRange
{
    public const int MaxLength = 30;

    private static readonly string[] AcceptedDateFormats = ["yyyy-MM-dd", "yyyy-MM"];

    public DateOnly Start { get; }
    public DateOnly? End { get; }
    public bool IsCurrent => End is null;

    public string StartText => Start.ToString("yyyy-MM", CultureInfo.InvariantCulture);
    public string? EndText => End?.ToString("yyyy-MM", CultureInfo.InvariantCulture);

    private DateRange() { } // EF Core

    private DateRange(DateOnly start, DateOnly? end)
    {
        Start = start;
        End = end;
    }

    public static Result<DateRange> Create(string? start, string? end)
    {
        if (!TryParse(start, out var parsedStart))
            return Error.Validation("DateRange.StartInvalid", "Start date is invalid. Use the 'yyyy-MM' or 'yyyy-MM-dd' format.");

        if (string.IsNullOrWhiteSpace(end))
            return new DateRange(parsedStart, null);

        if (!TryParse(end, out var parsedEnd))
            return Error.Validation("DateRange.EndInvalid", "End date is invalid. Use the 'yyyy-MM' or 'yyyy-MM-dd' format.");

        if (parsedEnd < parsedStart)
            return Error.Validation("DateRange.EndBeforeStart", "End date cannot be earlier than the start date.");

        return new DateRange(parsedStart, parsedEnd);
    }

    public static Result<DateRange> CreateCurrent(string? start)
    {
        var result = Create(start, null);
        return result.IsSuccess
            ? Result.Success(result.Value)
            : Result.Failure<DateRange>(result.Error);
    }

    private static bool TryParse(string? value, out DateOnly parsed)
    {
        parsed = default;

        if (string.IsNullOrWhiteSpace(value))
            return false;

        var trimmed = value.Trim();
        if (trimmed.Length > 50)
            return false;

        // 1. Direct standard date formats (yyyy-MM-dd, yyyy-MM)
        if (DateOnly.TryParseExact(
            trimmed,
            AcceptedDateFormats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out parsed))
        {
            return true;
        }

        // 2. Full ISO 8601 strings with time and/or timezone offsets (e.g. 2024-04-30T22:00:00Z)
        if (DateTimeOffset.TryParse(trimmed, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dto))
        {
            parsed = DateOnly.FromDateTime(dto.UtcDateTime);
            return true;
        }

        // 3. Fallback: extract date component before 'T'
        var datePart = trimmed.Split('T')[0].Trim();
        return DateOnly.TryParseExact(
            datePart,
            AcceptedDateFormats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out parsed);
    }

    public override string ToString() => End is null ? StartText : $"{StartText} - {EndText}";
}
