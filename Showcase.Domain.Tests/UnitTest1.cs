using System;
using System.Collections.Generic;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;
using Xunit;

namespace Showcase.Domain.Tests;

public class DomainTests
{
    // --- Value Objects: Bio ---

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Bio_Create_EmptyOrWhitespace_ReturnsFailure(string? input)
    {
        var result = Bio.Create(input);
        Assert.True(result.IsFailure);
        Assert.Equal("Bio.Empty", result.Error.Code);
    }

    [Fact]
    public void Bio_Create_TooLong_ReturnsFailure()
    {
        var longBio = new string('a', 501);
        var result = Bio.Create(longBio);
        Assert.True(result.IsFailure);
        Assert.Equal("Bio.TooLong", result.Error.Code);
    }

    [Fact]
    public void Bio_Create_Valid_ReturnsSuccessAndTrims()
    {
        var result = Bio.Create("  Valid Bio text  ");
        Assert.True(result.IsSuccess);
        Assert.Equal("Valid Bio text", result.Value.Value);
    }

    [Fact]
    public void Bio_CreateOptional_Empty_ReturnsSuccessWithNull()
    {
        var result = Bio.CreateOptional("   ");
        Assert.True(result.IsSuccess);
        Assert.Null(result.Value);
    }

    // --- Value Objects: Url ---

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Url_Create_EmptyOrWhitespace_ReturnsFailure(string? input)
    {
        var result = Url.Create(input);
        Assert.True(result.IsFailure);
        Assert.Equal("Url.Empty", result.Error.Code);
    }

    [Theory]
    [InlineData("not-a-url")]
    [InlineData("ftp://example.com/file")]
    [InlineData("javascript:alert(1)")]
    [InlineData("/relative/path")]
    public void Url_Create_InvalidUrl_ReturnsFailure(string input)
    {
        var result = Url.Create(input);
        Assert.True(result.IsFailure);
        Assert.Equal("Url.Invalid", result.Error.Code);
    }

    [Theory]
    [InlineData("https://github.com/developer")]
    [InlineData("http://example.com")]
    public void Url_Create_ValidUrl_ReturnsSuccess(string input)
    {
        var result = Url.Create(input);
        Assert.True(result.IsSuccess);
        Assert.Equal(input, result.Value.Value);
    }

    [Fact]
    public void Url_CreateOptional_Empty_ReturnsSuccessWithNull()
    {
        var result = Url.CreateOptional(null);
        Assert.True(result.IsSuccess);
        Assert.Null(result.Value);
    }

    // --- Value Objects: StorageKey ---

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void StorageKey_Create_EmptyOrWhitespace_ReturnsFailure(string? input)
    {
        var result = StorageKey.Create(input);
        Assert.True(result.IsFailure);
        Assert.Equal("StorageKey.Empty", result.Error.Code);
    }

    [Fact]
    public void StorageKey_Create_Valid_ReturnsSuccess()
    {
        var result = StorageKey.Create("avatars/user-123.jpg");
        Assert.True(result.IsSuccess);
        Assert.Equal("avatars/user-123.jpg", result.Value.Value);
    }

    // --- Post Aggregate & Invariants ---

    [Fact]
    public void Post_Create_EmptyTitle_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => new Post(Guid.NewGuid(), ""));
    }

    [Fact]
    public void Post_Create_EmptyProfileId_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => new Post(Guid.Empty, "Valid Title"));
    }

    [Fact]
    public void Post_Publish_WithoutImages_ReturnsCannotPublishEmptyPost()
    {
        var post = new Post(Guid.NewGuid(), "My Project", "Description");
        var result = post.Publish();

        Assert.True(result.IsFailure);
        Assert.Equal(PostErrors.CannotPublishEmptyPost.Code, result.Error.Code);
        Assert.Equal(PostStatus.Draft, post.Status);
    }

    [Fact]
    public void Post_Publish_WithImages_SetsPublishedStatusAndTimestamp()
    {
        var post = new Post(Guid.NewGuid(), "My Project", "Description");
        var storageKey = StorageKey.Create("images/post-1.png").Value;
        post.AddImage(storageKey);

        var result = post.Publish();

        Assert.True(result.IsSuccess);
        Assert.Equal(PostStatus.Published, post.Status);
        Assert.NotNull(post.PublishedAt);
    }

    [Fact]
    public void Post_Publish_AlreadyPublished_PreservesOriginalPublishedAt()
    {
        var post = new Post(Guid.NewGuid(), "My Project", "Description");
        var storageKey = StorageKey.Create("images/post-1.png").Value;
        post.AddImage(storageKey);

        post.Publish();
        var originalPublishedAt = post.PublishedAt;

        post.Publish();
        Assert.Equal(originalPublishedAt, post.PublishedAt);
    }

    [Fact]
    public void Post_Unpublish_SetsUnpublishedStatus()
    {
        var post = new Post(Guid.NewGuid(), "My Project");
        var storageKey = StorageKey.Create("images/post-1.png").Value;
        post.AddImage(storageKey);
        post.Publish();

        var result = post.Unpublish();

        Assert.True(result.IsSuccess);
        Assert.Equal(PostStatus.Unpublished, post.Status);
    }

    [Fact]
    public void Post_RemoveImage_PublishedPostWithSingleImage_ReturnsCannotPublishEmptyPost()
    {
        var post = new Post(Guid.NewGuid(), "My Project");
        var storageKey = StorageKey.Create("images/post-1.png").Value;
        var image = post.AddImage(storageKey);
        post.Publish();

        var result = post.RemoveImage(image.Id);

        Assert.True(result.IsFailure);
        Assert.Equal(PostErrors.CannotPublishEmptyPost.Code, result.Error.Code);
        Assert.Single(post.Images);
    }

    [Fact]
    public void Post_RemoveImage_PublishedPostWithMultipleImages_RemovesImageSuccessfully()
    {
        var post = new Post(Guid.NewGuid(), "My Project");
        var key1 = StorageKey.Create("images/post-1.png").Value;
        var key2 = StorageKey.Create("images/post-2.png").Value;
        var img1 = post.AddImage(key1);
        var img2 = post.AddImage(key2);
        post.Publish();

        var result = post.RemoveImage(img1.Id);

        Assert.True(result.IsSuccess);
        Assert.Single(post.Images);
        Assert.Equal(img2.Id, post.Images.First().Id);
    }

    [Fact]
    public void Post_ReorderImages_UpdatesDisplayOrders()
    {
        var post = new Post(Guid.NewGuid(), "My Project");
        var key1 = StorageKey.Create("images/post-1.png").Value;
        var key2 = StorageKey.Create("images/post-2.png").Value;
        var img1 = post.AddImage(key1, 0);
        var img2 = post.AddImage(key2, 1);

        post.ReorderImages(new Dictionary<Guid, int>
        {
            [img1.Id] = 10,
            [img2.Id] = 20
        });

        Assert.Equal(10, post.Images.First(i => i.Id == img1.Id).DisplayOrder);
        Assert.Equal(20, post.Images.First(i => i.Id == img2.Id).DisplayOrder);
    }

    // --- Profile Aggregate ---

    [Fact]
    public void Profile_Create_WhitespaceUserId_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => new Profile("", "John", "Doe"));
    }

    [Fact]
    public void Profile_UpdateDetails_UpdatesValuesAndTimestamp()
    {
        var profile = new Profile("user-1", "John", "Doe");
        var bio = Bio.Create("Senior Engineer").Value;

        profile.UpdateDetails("Jane", "Smith", bio);

        Assert.Equal("Jane", profile.FirstName);
        Assert.Equal("Smith", profile.LastName);
        Assert.Equal("Senior Engineer", profile.Bio?.Value);
        Assert.NotNull(profile.UpdatedAt);
    }

    [Fact]
    public void Profile_SetAvatar_And_RemoveAvatar_WorksCorrectly()
    {
        var profile = new Profile("user-1", "John", "Doe");
        var avatarKey = StorageKey.Create("avatars/user-1.png").Value;

        profile.SetAvatar(avatarKey);
        Assert.Equal(avatarKey, profile.AvatarKey);

        profile.RemoveAvatar();
        Assert.Null(profile.AvatarKey);
    }

    [Fact]
    public void Profile_SocialLinks_Add_Update_Remove_Reorder()
    {
        var profile = new Profile("user-1", "John", "Doe");
        var url1 = Url.Create("https://github.com/john").Value;
        var url2 = Url.Create("https://linkedin.com/in/john").Value;

        // Add
        var link1 = profile.AddSocialLink("GitHub", url1);
        var link2 = profile.AddSocialLink("LinkedIn", url2);
        Assert.Equal(2, profile.SocialLinks.Count);

        // Update
        var updatedUrl = Url.Create("https://github.com/johndoe").Value;
        var updateResult = profile.UpdateSocialLink(link1.Id, "GitHub", updatedUrl);
        Assert.True(updateResult.IsSuccess);
        Assert.Equal("https://github.com/johndoe", profile.SocialLinks.First(l => l.Id == link1.Id).Url.Value);

        // Reorder
        profile.ReorderSocialLinks(new Dictionary<Guid, int>
        {
            [link1.Id] = 5,
            [link2.Id] = 1
        });
        Assert.Equal(5, profile.SocialLinks.First(l => l.Id == link1.Id).DisplayOrder);
        Assert.Equal(1, profile.SocialLinks.First(l => l.Id == link2.Id).DisplayOrder);

        // Remove
        var removeResult = profile.RemoveSocialLink(link1.Id);
        Assert.True(removeResult.IsSuccess);
        Assert.Single(profile.SocialLinks);
    }
}
