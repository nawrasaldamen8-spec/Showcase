using System;
using MediatR;

namespace Showcase.Application.Features.Notifications.Events;

public record ContentReportResolvedNotificationEvent(
    Guid ReportId,
    string TargetType,
    string TargetId,
    string TargetLabel,
    string ActionTaken) : INotification;
