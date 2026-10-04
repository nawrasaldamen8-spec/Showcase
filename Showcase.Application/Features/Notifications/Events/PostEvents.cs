using System;
using System.Collections.Generic;
using MediatR;

namespace Showcase.Application.Features.Notifications.Events;

public record PostLikedNotificationEvent(
    string TargetUserId,
    string SourceUserId,
    Guid PostId,
    string PostTitle) : INotification;

public record PostDeletedNotificationEvent(
    Guid PostId,
    IReadOnlyList<string> StorageKeys) : INotification;
