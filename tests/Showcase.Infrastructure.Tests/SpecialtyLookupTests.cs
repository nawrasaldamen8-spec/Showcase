using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Features.Lookups.Queries;
using Showcase.Domain.Entities;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class SpecialtyLookupTests
{
    [Fact]
    public void SpecialtyReference_Should_Instantiate_With_Valid_Data()
    {
        var specialty = new SpecialtyReference(1, "0731", "Architecture and town planning", "Engineering, Architecture & Construction", "Architecture");
        Assert.Equal(1, specialty.Id);
        Assert.Equal("0731", specialty.Code);
        Assert.Equal("Architecture and town planning", specialty.Name);
        Assert.Equal("Engineering, Architecture & Construction", specialty.Category);
        Assert.Equal("Architecture", specialty.SubField);
    }

    [Fact]
    public void SpecialtyReference_Should_Throw_When_Id_Invalid()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new SpecialtyReference(0, "0731", "Architecture", "Engineering", "SubField"));
    }

    [Fact]
    public void SpecialtyReference_Should_Throw_When_Name_Empty()
    {
        Assert.Throws<ArgumentException>(() => new SpecialtyReference(1, "0731", "  ", "Engineering", "SubField"));
    }

    [Fact]
    public async Task GetSpecialtiesQueryHandler_Should_Group_By_Category()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var context = new ApplicationDbContext(options);
        context.SpecialtyReferences.AddRange(
            new SpecialtyReference(1, "0612", "Software and applications development", "Information & Communication Technologies", "Software"),
            new SpecialtyReference(2, "0613", "Database and network design", "Information & Communication Technologies", "Database"),
            new SpecialtyReference(3, "0731", "Architecture and town planning", "Engineering, Architecture & Construction", "Architecture")
        );
        await context.SaveChangesAsync();

        var handler = new GetSpecialtiesQueryHandler(context);

        // Act
        var result = await handler.Handle(new GetSpecialtiesQuery(), CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.Count); // 2 categories

        var techCategory = result.Value.FirstOrDefault(c => c.Name == "Information & Communication Technologies");
        Assert.NotNull(techCategory);
        Assert.Equal(2, techCategory.Specialties.Count);

        var engCategory = result.Value.FirstOrDefault(c => c.Name == "Engineering, Architecture & Construction");
        Assert.NotNull(engCategory);
        Assert.Single(engCategory.Specialties);
    }
}
