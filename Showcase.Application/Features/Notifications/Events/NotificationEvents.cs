using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Notifications.Events;

public record PostLikedNotificationEvent(
    string TargetUserId,
    string SourceUserId,
    Guid PostId,
    string PostTitle) : INotification;

public record VerificationApprovedNotificationEvent(
    string TargetUserId,
    string? Note) : INotification;

public record VerificationRejectedNotificationEvent(
    string TargetUserId,
    string? Note) : INotification;

public record FeaturedApprovedNotificationEvent(
    string TargetUserId,
    string? Note) : INotification;

public record FeaturedRejectedNotificationEvent(
    string TargetUserId,
    string? Note) : INotification;

public class NotificationEventHandlers :
    INotificationHandler<PostLikedNotificationEvent>,
    INotificationHandler<VerificationApprovedNotificationEvent>,
    INotificationHandler<VerificationRejectedNotificationEvent>,
    INotificationHandler<FeaturedApprovedNotificationEvent>,
    INotificationHandler<FeaturedRejectedNotificationEvent>
{
    private readonly IApplicationDbContext _context;

    public NotificationEventHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(PostLikedNotificationEvent notification, CancellationToken ct)
    {
        if (notification.TargetUserId == notification.SourceUserId)
            return; // Avoid notifying self

        var item = new Notification(
            notification.TargetUserId,
            NotificationType.Like,
            "New Like",
            $"Someone liked your post '{notification.PostTitle}'",
            notification.PostId,
            notification.SourceUserId);

        _context.Notifications.Add(item);
        await _context.SaveChangesAsync(ct);
    }

    public async Task Handle(VerificationApprovedNotificationEvent notification, CancellationToken ct)
    {
        var item = new Notification(
            notification.TargetUserId,
            NotificationType.VerificationApproved,
            "Verification Approved",
            notification.Note ?? "Your verification request has been approved!");

        _context.Notifications.Add(item);
        await _context.SaveChangesAsync(ct);
    }

    public async Task Handle(VerificationRejectedNotificationEvent notification, CancellationToken ct)
    {
        var item = new Notification(
            notification.TargetUserId,
            NotificationType.VerificationRejected,
            "Verification Update",
            notification.Note ?? "Your verification request could not be approved at this time.");

        _context.Notifications.Add(item);
        await _context.SaveChangesAsync(ct);
    }

    public async Task Handle(FeaturedApprovedNotificationEvent notification, CancellationToken ct)
    {
        var item = new Notification(
            notification.TargetUserId,
            NotificationType.FeaturedApproved,
            "Featured Status Approved",
            notification.Note ?? "Your profile has been featured!");

        _context.Notifications.Add(item);
        await _context.SaveChangesAsync(ct);
    }

    public async Task Handle(FeaturedRejectedNotificationEvent notification, CancellationToken ct)
    {
        var item = new Notification(
            notification.TargetUserId,
            NotificationType.FeaturedRejected,
            "Featured Status Update",
            notification.Note ?? "Your featured request was reviewed.");

        _context.Notifications.Add(item);
        await _context.SaveChangesAsync(ct);
    }
}
