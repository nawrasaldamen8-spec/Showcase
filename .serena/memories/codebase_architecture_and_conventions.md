# Architecture and Code Conventions

## 1. Vertical Slice Architecture (Showcase.Application/Features)
- Every feature must be organized into:
  - `Commands/`: For write/mutation operations.
  - `Queries/`: For read/query operations.
  - `Common/` or `<Feature>Dtos.cs`: For shared DTOs and mappers.
- **Single Cohesive File Per Slice**: Combine the Command/Query record (implementing `IRequest<Result<T>>`), its sealed FluentValidation `AbstractValidator<T>`, and its internal sealed MediatR `IRequestHandler<T, Result<...>>` in the EXACT same `.cs` file (e.g. `CreatePost.cs`, `GetPostById.cs`).
- Never create fragmented single-class subdirectories for individual operations.

## 2. Domain Entities Structure (Showcase.Domain/Entities)
- Group domain entities by DDD aggregate/concept folders:
  - `Career/`: Academic, Achievement, CareerVisibility, Credential, Experience, Language, Skill.
  - `Profile/`: Profile, ProfileErrors, ProfileVisit, SocialLink, SocialLinkErrors.
  - `Post/`: Post, PostErrors, PostImage, PostImageErrors, PostLike, PostLikeErrors, PostTag, Tag, TagErrors.
  - `Moderation/`: ContentReport, VerificationRequest, FeaturedRequest, AuditLog.
  - `Lookup/`: Country, LanguageReference, SpecialtyReference.
  - `Notification/`: Notification, NotificationErrors.
- Always maintain the unified root namespace: `namespace Showcase.Domain.Entities;` across all entity files.

## 3. Database Seeding
- Restrict `DatabaseSeeder.cs` exclusively to official reference lookup data (Countries, Languages, Specialties) and standard system roles (AppRoles.Admin, AppRoles.User).
- Never seed fake accounts, dummy profiles, or hardcoded test credentials.
