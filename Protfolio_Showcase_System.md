# Personal Showcase System — Implementation Plan

## Goal

Build a simple backend for a personal showcase page where a person can present:

* Profile information
* Showcase items
* Social links
* Contact messages

The system represents **one showcase owner**. Multi-user support and authentication are out of scope.

## Stack

* .NET 10
* ASP.NET Core Minimal APIs
* EF Core 10
* SQL Server
* Clean Architecture
* CQRS + MediatR
* FluentValidation
* ProblemDetails
* Result / Result<T>

## Projects

```text
Showcase.Domain
Showcase.Application
Showcase.Infrastructure
Showcase.Api
```

Dependency direction:

```text
Api → Application → Domain
Infrastructure → Application → Domain
```

## Domain

### Profile

```text
Id
Name
Title
Bio
ProfileImageUrl
Location
```

Only one Profile exists.

### ShowcaseItem

```text
Id
Title
Description
ImageUrl
LinkUrl
DisplayOrder
IsFeatured
```

Generic item that can represent a project, design, photo, article, service, artwork, etc.

### SocialLink

```text
Id
ProfileId
Platform
Url
DisplayOrder
```

Profile has many SocialLinks.

### ContactMessage

```text
Id
Name
Email
Subject
Message
CreatedAt
IsRead
```

## Application Features

### Profile

```text
GetPublicProfile
UpdateProfile
```

### Showcase

```text
CreateShowcaseItem
UpdateShowcaseItem
DeleteShowcaseItem
GetShowcaseItems
GetShowcaseItemById
GetAdminShowcaseItems
```

### Social Links

```text
CreateSocialLink
UpdateSocialLink
DeleteSocialLink
```

### Contact Messages

```text
SubmitContactMessage
GetContactMessages
GetContactMessageById
MarkContactMessageAsRead
DeleteContactMessage
```

Use explicit DTOs and EF Core projections. No repositories, AutoMapper, or Mapster.

## API

### Public

```http
GET  /api/profile
GET  /api/showcase
GET  /api/showcase/{id}
POST /api/contact
```

### Admin

```http
PUT    /api/admin/profile

GET    /api/admin/showcase
POST   /api/admin/showcase
PUT    /api/admin/showcase/{id}
DELETE /api/admin/showcase/{id}

POST   /api/admin/social-links
PUT    /api/admin/social-links/{id}
DELETE /api/admin/social-links/{id}

GET    /api/admin/messages
GET    /api/admin/messages/{id}
PUT    /api/admin/messages/{id}/read
DELETE /api/admin/messages/{id}
```

Authentication is not implemented yet. The `/admin` routes are reserved for future authentication.

## Infrastructure

* Implement `IApplicationDbContext`
* Create `ShowcaseDbContext`
* Add EF Core configurations
* Add SQL Server configuration
* Add migration
* Seed one Profile

## API Rules

* FluentValidation for input validation
* ProblemDetails for errors
* `404` for not found
* `400` for validation errors
* `409` for conflicts
* Rate limit `POST /api/contact`

## Out of Scope

```text
Authentication
Users
Roles
Permissions
Categories
Technologies
Tags
File uploads
Analytics
Comments
Likes
Multiple showcase owners
Payments
Notifications
```

## Completion

The project is complete when:

```bash
dotnet build
```

passes and the public/admin endpoints work correctly with the SQL Server database.
