# Real-time Notifications, SignalR Integration & Unread Counter Badge

## Overview
Added real-time notification arrival via ASP.NET Core SignalR, replacing manual refresh requirements with instant unread count synchronization, a clean numeric unread badge, and a subtle one-shot attention animation on arrival.

## Key Changes

### 1. Backend Real-time Event Publishing
- **Injected `IRealtimeNotifier`**: Updated `NotificationEventHandlers` (`NotificationEvents.cs`) and `TrackProfileVisitCommandHandler` (`TrackProfileVisit.cs`) to publish real-time events via `IRealtimeNotifier.PublishToUserAsync(targetUserId, title, message, payload)` when notifications (likes, visits, verifications, featured status) are created.
- **SignalR Hub (`NotificationHub`)**: Mapped at `/hubs/notifications` with JWT query string authentication.

### 2. Frontend Real-time Integration & Unread Counter
- **SignalR Hook (`useNotificationRealtime.ts`)**: Connects to `/hubs/notifications` with automatic reconnect. On receiving `NotificationReceived` or `BroadcastReceived`, immediately invalidates the notifications query cache in TanStack Query to update unread count without displaying intrusive popups or message contents.
- **NotificationBellBadge Component (`NotificationBellBadge.tsx`)**:
  - Replaced the simple dot indicator with a clear numeric badge (`1`, `4`, `9+`).
  - Sized comfortably with a circular/pill container in Pority Clay (`#D35400`) and ivory text.
  - Subscribes to new notification arrivals and triggers a single gentle 600ms attention animation (subtle scale-pop and slight bell tilt), stopping automatically without continuous looping.
- **Global Integration**: Integrated `useNotificationRealtime` in `AppLayout.tsx` and updated both `SidebarNavLinks.tsx` and `MobileTopBar.tsx` with `NotificationBellBadge`.

## Verification
- Frontend build passed: `npm run build` (built in 1.86s).
- Backend build passed: `dotnet build Showcase.slnx -m:1` (0 warnings, 0 errors).
- Live browser verification in Chrome DevTools MCP confirmed numeric badge rendering, real-time cache sync, and auto-clearing upon navigating to `/notifications`.
