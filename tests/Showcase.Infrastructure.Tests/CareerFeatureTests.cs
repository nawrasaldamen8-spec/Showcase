using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Academics;
using Showcase.Application.Features.Career.Achievements;
using Showcase.Application.Features.Career.Credentials;
using Showcase.Application.Features.Career.Experiences;
using Showcase.Application.Features.Career.Languages;
using Showcase.Application.Features.Career.Queries;
using Showcase.Application.Features.Career.Skills;
using Showcase.Application.Features.Career.Visibility;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class CareerFeatureTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static (ApplicationDbContext dbContext, Mock<ICurrentUserService> currentUserService, Profile profile) SetupUserAndProfile(string userId = "user-123")
    {
        var dbContext = CreateInMemoryDbContext();
        var currentUserService = new Mock<ICurrentUserService>();
        currentUserService.Setup(s => s.UserId).Returns(userId);
        currentUserService.Setup(s => s.IsAuthenticated).Returns(true);

        var profile = new Profile(userId, "Test User");
        dbContext.Profiles.Add(profile);
        dbContext.SaveChanges();

        return (dbContext, currentUserService, profile);
    }

    [Fact]
    public async Task CreateExperience_Should_Create_Experience_Successfully()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var handler = new CreateExperienceCommandHandler(currentUserService.Object, dbContext);

        var command = new CreateExperienceCommand(
            JobTitle: "Software Engineer",
            Company: "Acme Corp",
            StartDate: "2023-01",
            EndDate: null,
            CurrentlyWorking: true,
            Description: "Developing scalable cloud solutions.",
            Achievements: null,
            EmploymentType: "FullTime",
            Location: "Amman, Jordan",
            SkillsUsed: new List<string> { "C#", ".NET" }
        );

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("Software Engineer", result.Value.JobTitle);
        Assert.Equal("Acme Corp", result.Value.Company);
        Assert.True(result.Value.CurrentlyWorking);

        var count = await dbContext.Experiences.CountAsync(e => e.ProfileId == profile.Id);
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task GetExperiences_Should_Return_List_For_Profile()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var exp = new Experience(
            profile.Id,
            "Backend Developer",
            "Tech Co",
            DateRange.Create("2022-01", "2023-05").Value,
            "Worked on APIs"
        );
        dbContext.Experiences.Add(exp);
        await dbContext.SaveChangesAsync();

        var handler = new GetExperiencesQueryHandler(currentUserService.Object, dbContext);
        var result = await handler.Handle(new GetExperiencesQuery(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
        Assert.Equal("Backend Developer", result.Value[0].JobTitle);
    }

    [Fact]
    public async Task UpdateExperience_Should_Modify_Existing_Experience()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var exp = new Experience(
            profile.Id,
            "Junior Dev",
            "Startup",
            DateRange.Create("2021-01", "2022-01").Value,
            "Initial role"
        );
        dbContext.Experiences.Add(exp);
        await dbContext.SaveChangesAsync();

        var handler = new UpdateExperienceCommandHandler(currentUserService.Object, dbContext);
        var command = new UpdateExperienceCommand(
            Id: exp.Id,
            JobTitle: "Senior Dev",
            Company: "Startup Upgraded",
            StartDate: "2021-01",
            EndDate: "2022-06",
            CurrentlyWorking: false,
            Description: "Lead architect role",
            Achievements: null,
            EmploymentType: "FullTime",
            Location: "Amman",
            SkillsUsed: null
        );

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Senior Dev", result.Value.JobTitle);
        Assert.Equal("Startup Upgraded", result.Value.Company);
    }

    [Fact]
    public async Task DeleteExperience_Should_Remove_Experience()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var exp = new Experience(
            profile.Id,
            "Dev",
            "Corp",
            DateRange.Create("2021-01", null).Value
        );
        dbContext.Experiences.Add(exp);
        await dbContext.SaveChangesAsync();

        var handler = new DeleteExperienceCommandHandler(currentUserService.Object, dbContext);
        var result = await handler.Handle(new DeleteExperienceCommand(exp.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var count = await dbContext.Experiences.CountAsync(e => e.ProfileId == profile.Id);
        Assert.Equal(0, count);
    }

    [Fact]
    public async Task CreateAcademic_And_GetAcademics_Should_Work()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var addHandler = new CreateAcademicCommandHandler(currentUserService.Object, dbContext);

        var addResult = await addHandler.Handle(new CreateAcademicCommand(
            Institution: "University of Jordan",
            Degree: "Bachelor of Science",
            FieldOfStudy: "Computer Science",
            StartDate: "2018-09",
            EndDate: "2022-06",
            CurrentlyStudying: false,
            Gpa: "3.8/4.0",
            Achievements: "Competitive Programming Club",
            Location: "Amman, Jordan",
            Description: "Focused on Algorithms and Distributed Systems"
        ), CancellationToken.None);

        Assert.True(addResult.IsSuccess);
        Assert.Equal("University of Jordan", addResult.Value.Institution);

        var getHandler = new GetAcademicsQueryHandler(currentUserService.Object, dbContext);
        var getResult = await getHandler.Handle(new GetAcademicsQuery(), CancellationToken.None);

        Assert.True(getResult.IsSuccess);
        Assert.Single(getResult.Value);
    }

    [Fact]
    public async Task CreateSkill_And_GetSkills_Should_Work()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var addHandler = new CreateSkillCommandHandler(currentUserService.Object, dbContext);

        var addResult = await addHandler.Handle(new CreateSkillCommand(
            Name: "C# / .NET",
            Category: "Backend"
        ), CancellationToken.None);

        Assert.True(addResult.IsSuccess);
        Assert.Equal("C# / .NET", addResult.Value.Name);

        var getHandler = new GetSkillsQueryHandler(currentUserService.Object, dbContext);
        var getResult = await getHandler.Handle(new GetSkillsQuery(), CancellationToken.None);

        Assert.True(getResult.IsSuccess);
        Assert.Single(getResult.Value);
    }

    [Fact]
    public async Task CreateCredential_And_GetCredentials_Should_Work()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var addHandler = new CreateCredentialCommandHandler(currentUserService.Object, dbContext);

        var addResult = await addHandler.Handle(new CreateCredentialCommand(
            Name: "AWS Certified Solutions Architect",
            IssuingOrganization: "Amazon Web Services",
            IssueDate: "2024-01",
            ExpiryDate: "2027-01",
            DoesNotExpire: false,
            CredentialId: "AWS-12345",
            VerificationUrl: "https://aws.amazon.com/verify/12345"
        ), CancellationToken.None);

        Assert.True(addResult.IsSuccess);
        Assert.Equal("AWS Certified Solutions Architect", addResult.Value.Name);

        var getHandler = new GetCredentialsQueryHandler(currentUserService.Object, dbContext);
        var getResult = await getHandler.Handle(new GetCredentialsQuery(), CancellationToken.None);

        Assert.True(getResult.IsSuccess);
        Assert.Single(getResult.Value);
    }

    [Fact]
    public async Task CreateLanguage_And_GetLanguages_Should_Work()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var addHandler = new CreateLanguageCommandHandler(currentUserService.Object, dbContext);

        var addResult = await addHandler.Handle(new CreateLanguageCommand(
            Language: "Arabic",
            Proficiency: "Native"
        ), CancellationToken.None);

        Assert.True(addResult.IsSuccess);
        Assert.Equal("Arabic", addResult.Value.Language);

        var getHandler = new GetLanguagesQueryHandler(currentUserService.Object, dbContext);
        var getResult = await getHandler.Handle(new GetLanguagesQuery(), CancellationToken.None);

        Assert.True(getResult.IsSuccess);
        Assert.Single(getResult.Value);
    }

    [Fact]
    public async Task CreateAchievement_And_GetAchievements_Should_Work()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();
        var addHandler = new CreateAchievementCommandHandler(currentUserService.Object, dbContext);

        var addResult = await addHandler.Handle(new CreateAchievementCommand(
            Title: "First Place in Hackathon",
            Organization: "Tech Hub",
            Date: "2025-05",
            Description: "Built an AI-powered code analysis tool"
        ), CancellationToken.None);

        Assert.True(addResult.IsSuccess);
        Assert.Equal("First Place in Hackathon", addResult.Value.Title);

        var getHandler = new GetAchievementsQueryHandler(currentUserService.Object, dbContext);
        var getResult = await getHandler.Handle(new GetAchievementsQuery(), CancellationToken.None);

        Assert.True(getResult.IsSuccess);
        Assert.Single(getResult.Value);
    }

    [Fact]
    public async Task CareerVisibility_Toggle_And_Query_Should_Work()
    {
        var (dbContext, currentUserService, profile) = SetupUserAndProfile();

        // 1. Get default visibility
        var getHandler = new GetCareerVisibilityQueryHandler(currentUserService.Object, dbContext);
        var getResult = await getHandler.Handle(new GetCareerVisibilityQuery(), CancellationToken.None);
        Assert.True(getResult.IsSuccess);
        Assert.True(getResult.Value.Experience);

        // 2. Toggle Experience section
        var toggleHandler = new ToggleSectionVisibilityCommandHandler(currentUserService.Object, dbContext);
        var toggleResult = await toggleHandler.Handle(new ToggleSectionVisibilityCommand("experience", false), CancellationToken.None);
        Assert.True(toggleResult.IsSuccess);
        Assert.False(toggleResult.Value.Experience);

        // 3. Update full visibility object
        var updateHandler = new UpdateCareerVisibilityCommandHandler(currentUserService.Object, dbContext);
        var updateResult = await updateHandler.Handle(new UpdateCareerVisibilityCommand(
            Experience: false,
            Academics: true,
            Skills: false,
            Credentials: true,
            Languages: true,
            Achievements: false
        ), CancellationToken.None);

        Assert.True(updateResult.IsSuccess);
        Assert.False(updateResult.Value.Experience);
        Assert.True(updateResult.Value.Academics);
        Assert.False(updateResult.Value.Skills);
    }

    [Fact]
    public async Task GetPublicCareer_Should_Filter_Hidden_Sections_For_Public_Viewer()
    {
        var (dbContext, _, profile) = SetupUserAndProfile("owner-id");

        // Add public viewer mock
        var viewerService = new Mock<ICurrentUserService>();
        viewerService.Setup(s => s.UserId).Returns("viewer-id");
        viewerService.Setup(s => s.IsAuthenticated).Returns(true);

        var identityService = new Mock<IIdentityService>();
        identityService.Setup(s => s.GetUserByUsernameAsync("testuser", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Showcase.Domain.Common.Results.Result.Success(new UserIdentityDetails("owner-id", "test@user.com", "testuser", new List<string>())));

        // Add an experience and a skill
        dbContext.Experiences.Add(new Experience(profile.Id, "Dev", "Corp", DateRange.Create("2021-01", null).Value));
        dbContext.Skills.Add(new Skill(profile.Id, "C#", "Backend"));

        // Set visibility: Hide Experience, Show Skills
        var visibility = new CareerVisibility(profile.Id);
        visibility.Update(false, true, true, true, true, true);
        dbContext.CareerVisibilities.Add(visibility);
        await dbContext.SaveChangesAsync();

        var handler = new GetPublicCareerQueryHandler(viewerService.Object, identityService.Object, dbContext);
        var result = await handler.Handle(new GetPublicCareerQuery("testuser"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.Experiences); // Hidden for public viewer
        Assert.Single(result.Value.Skills); // Visible
    }
}
