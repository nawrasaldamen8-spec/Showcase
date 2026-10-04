using System;
using Showcase.Domain.Common.Results;

namespace Showcase.Domain.Entities;

public static class ContentReportErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("ContentReport.NotFound", $"Content report with ID '{id}' was not found.");

    public static readonly Error NotPending =
        Error.Conflict("ContentReport.NotPending", "This report is not in a pending state.");
}
