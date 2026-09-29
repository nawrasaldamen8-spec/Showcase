using System;
using System.Collections.Generic;

namespace Showcase.Application.Features.Career.Common;

public record CareerExperienceDto(
    Guid Id,
    string JobTitle,
    string Company,
    string StartDate,
    string? EndDate,
    bool CurrentlyWorking,
    string? Description,
    string? Achievements,
    string? EmploymentType,
    string? Location,
    IReadOnlyList<string> SkillsUsed,
    DateTime CreatedAt);

public record CareerAcademicDto(
    Guid Id,
    string Institution,
    string Degree,
    string FieldOfStudy,
    string StartDate,
    string? EndDate,
    bool CurrentlyStudying,
    string? Gpa,
    string? Achievements,
    string? Location,
    string? Description,
    DateTime CreatedAt);

public record CareerSkillDto(
    Guid Id,
    string Name,
    string? Category,
    DateTime CreatedAt);

public record CareerCredentialDto(
    Guid Id,
    string Name,
    string IssuingOrganization,
    string IssueDate,
    string? ExpiryDate,
    bool DoesNotExpire,
    string? CredentialId,
    string? VerificationUrl,
    string? MediaUrl,
    DateTime CreatedAt);

public record CareerLanguageDto(
    Guid Id,
    string Language,
    string Proficiency,
    DateTime CreatedAt);

public record CareerAchievementDto(
    Guid Id,
    string Title,
    string? Type,
    string? Organization,
    string? Date,
    string? Url,
    string? MediaUrl,
    string? Description,
    DateTime CreatedAt);

public record CareerVisibilityDto(
    bool Experience,
    bool Academics,
    bool Skills,
    bool Credentials,
    bool Languages,
    bool Achievements);

public record CareerSummaryResponse(
    int ExperiencesCount,
    int AcademicsCount,
    int SkillsCount,
    int CredentialsCount,
    int LanguagesCount,
    int AchievementsCount,
    CareerVisibilityDto Visibility);

public record PublicCareerDataResponse(
    IReadOnlyList<CareerExperienceDto> Experiences,
    IReadOnlyList<CareerAcademicDto> Academics,
    IReadOnlyList<CareerSkillDto> Skills,
    IReadOnlyList<CareerCredentialDto> Credentials,
    IReadOnlyList<CareerLanguageDto> Languages,
    IReadOnlyList<CareerAchievementDto> Achievements,
    CareerVisibilityDto Visibility);
