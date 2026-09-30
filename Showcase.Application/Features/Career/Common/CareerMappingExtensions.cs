using System;
using System.Collections.Generic;
using System.Linq;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Common;

public static class CareerMappingExtensions
{
    public static CareerExperienceDto ToDto(this Experience e) =>
        new(
            e.Id,
            e.JobTitle,
            e.Company,
            e.Period.StartText,
            e.Period.EndText,
            e.Period.IsCurrent,
            e.Description,
            e.Achievements,
            e.EmploymentType,
            e.Location,
            e.SkillsUsed.ToList(),
            e.CreatedAtUtc);

    public static CareerAcademicDto ToDto(this Academic a) =>
        new(
            a.Id,
            a.Institution,
            a.Degree,
            a.FieldOfStudy,
            a.Period.StartText,
            a.Period.EndText,
            a.Period.IsCurrent,
            a.Gpa,
            a.Achievements,
            a.Location,
            a.Description,
            a.CreatedAtUtc);

    public static CareerSkillDto ToDto(this Skill s) =>
        new(
            s.Id,
            s.Name,
            s.Category,
            s.CreatedAtUtc);

    public static CareerCredentialDto ToDto(this Credential c) =>
        new(
            c.Id,
            c.Name,
            c.IssuingOrganization,
            c.Validity.StartText,
            c.Validity.EndText,
            c.Validity.IsCurrent,
            c.CredentialId,
            c.VerificationUrl?.Value,
            c.MediaUrl?.Value,
            c.CreatedAtUtc);

    public static CareerLanguageDto ToDto(this Language l) =>
        new(
            l.Id,
            l.LanguageName,
            l.Proficiency.ToString(),
            l.CreatedAtUtc);

    public static CareerAchievementDto ToDto(this Achievement a) =>
        new(
            a.Id,
            a.Title,
            a.Type,
            a.Organization,
            a.Date,
            a.Url?.Value,
            a.MediaUrl?.Value,
            a.Description,
            a.CreatedAtUtc);

    public static CareerVisibilityDto ToDto(this CareerVisibility? v) =>
        v is null
            ? new CareerVisibilityDto(true, true, true, true, true, true)
            : new CareerVisibilityDto(
                v.Experience,
                v.Academics,
                v.Skills,
                v.Credentials,
                v.Languages,
                v.Achievements);
}
