using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;
using Showcase.Infrastructure.Data;
using Showcase.Infrastructure.Data.Seed;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class ReferenceDataAndEntityTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public void Country_Should_Instantiate_With_Valid_Data()
    {
        var country = new Country(400, "jo", "jor", "Jordan");

        Assert.Equal(400, country.Id);
        Assert.Equal("jo", country.Alpha2);
        Assert.Equal("jor", country.Alpha3);
        Assert.Equal("Jordan", country.Name);
    }

    [Theory]
    [InlineData(0, "jo", "jor", "Jordan")]
    [InlineData(-1, "jo", "jor", "Jordan")]
    [InlineData(400, "j", "jor", "Jordan")]
    [InlineData(400, "joo", "jor", "Jordan")]
    [InlineData(400, "jo", "jo", "Jordan")]
    [InlineData(400, "jo", "jorr", "Jordan")]
    [InlineData(400, "jo", "jor", "")]
    public void Country_Should_Throw_On_Invalid_Data(int id, string alpha2, string alpha3, string name)
    {
        Assert.ThrowsAny<ArgumentException>(() => new Country(id, alpha2, alpha3, name));
    }

    [Fact]
    public void LanguageReference_Should_Instantiate_With_Valid_Data()
    {
        var lang = new LanguageReference("ar", "Arabic");

        Assert.Equal("ar", lang.Code);
        Assert.Equal("Arabic", lang.Name);
    }

    [Theory]
    [InlineData("", "Arabic")]
    [InlineData("ar", "")]
    [InlineData("   ", "Arabic")]
    public void LanguageReference_Should_Throw_On_Invalid_Data(string code, string name)
    {
        Assert.ThrowsAny<ArgumentException>(() => new LanguageReference(code, name));
    }

    [Fact]
    public void VerificationRequest_Should_Store_All_Five_Additional_Fields()
    {
        var request = new VerificationRequest(
            userId: "user-123",
            message: "Please verify my creator profile.",
            category: "architect",
            identificationNumber: "ID-987654",
            websiteUrl: "https://myfirm.com",
            portfolioUrl: "https://behance.net/portfolio",
            documentUrl: "docs/verification-doc.pdf");

        Assert.Equal("user-123", request.UserId);
        Assert.Equal("Please verify my creator profile.", request.Message);
        Assert.Equal("architect", request.Category);
        Assert.Equal("ID-987654", request.IdentificationNumber);
        Assert.Equal("https://myfirm.com", request.WebsiteUrl);
        Assert.Equal("https://behance.net/portfolio", request.PortfolioUrl);
        Assert.Equal("docs/verification-doc.pdf", request.DocumentUrl);
    }

    [Fact]
    public void Experience_Should_Store_EmploymentType_And_Location()
    {
        var period = DateRange.Create("2022-01", "2024-01").Value;
        var exp = new Experience(
            profileId: Guid.NewGuid(),
            jobTitle: "Senior Architect",
            company: "Creative Studio",
            period: period,
            description: "Led architectural visualization projects.",
            achievements: "Won 2 design competitions.",
            employmentType: "Full-time",
            location: "Amman, Jordan");

        Assert.Equal("Full-time", exp.EmploymentType);
        Assert.Equal("Amman, Jordan", exp.Location);

        exp.Update(
            "Principal Architect",
            "Creative Studio",
            period,
            "Expanded team leadership.",
            "International awards.",
            "Freelance",
            "Dubai, UAE");

        Assert.Equal("Freelance", exp.EmploymentType);
        Assert.Equal("Dubai, UAE", exp.Location);
    }

    [Fact]
    public void Academic_Should_Store_Location_And_Description()
    {
        var period = DateRange.Create("2018-09", "2022-06").Value;
        var academic = new Academic(
            profileId: Guid.NewGuid(),
            institution: "University of Jordan",
            degree: "Bachelor of Architecture",
            fieldOfStudy: "Architecture",
            period: period,
            gpa: "3.8",
            achievements: "Honor list",
            location: "Amman, Jordan",
            description: "Comprehensive 5-year architectural curriculum.");

        Assert.Equal("Amman, Jordan", academic.Location);
        Assert.Equal("Comprehensive 5-year architectural curriculum.", academic.Description);

        academic.Update(
            "University of Jordan",
            "Master of Architecture",
            "Urban Design",
            period,
            "3.9",
            "First in class",
            "Amman, Jordan",
            "Advanced urban computational design.");

        Assert.Equal("Urban Design", academic.FieldOfStudy);
        Assert.Equal("Advanced urban computational design.", academic.Description);
    }

    [Fact]
    public async Task DatabaseSeeder_Should_Seed_Countries_And_Languages_Correctly()
    {
        using var context = CreateInMemoryDbContext();

        await DatabaseSeeder.SeedAsync(context);

        var countryCount = await context.Countries.CountAsync();
        var languageCount = await context.LanguageReferences.CountAsync();
        var specialtyCount = await context.SpecialtyReferences.CountAsync();
        var profileCount = await context.Profiles.CountAsync();

        Assert.Equal(249, countryCount);
        Assert.Equal(184, languageCount);
        Assert.True(specialtyCount > 3000);
        Assert.Equal(0, profileCount);

        var jordan = await context.Countries.FirstOrDefaultAsync(c => c.Alpha2 == "jo");
        Assert.NotNull(jordan);
        Assert.Equal("Jordan", jordan.Name);
        Assert.Equal(400, jordan.Id);

        var arabic = await context.LanguageReferences.FirstOrDefaultAsync(l => l.Code == "ar");
        Assert.NotNull(arabic);
        Assert.Equal("Arabic", arabic.Name);
    }

    [Theory]
    [InlineData("2024-05-01T00:00:00+03:00", 2024, 4, 30)] // +03:00 converted to UTC is April 30, 21:00 UTC
    [InlineData("2024-05-01T05:00:00Z", 2024, 5, 1)]
    [InlineData("2024-05-15", 2024, 5, 15)]
    [InlineData("2024-05", 2024, 5, 1)]
    public void DateRange_Should_Parse_Iso_Strings_And_Offsets(string input, int expectedYear, int expectedMonth, int expectedDay)
    {
        var result = DateRange.Create(input, null);
        Assert.True(result.IsSuccess);
        Assert.Equal(new DateOnly(expectedYear, expectedMonth, expectedDay), result.Value.Start);
    }
}

