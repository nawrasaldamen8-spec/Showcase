using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation.TestHelper;
using Microsoft.EntityFrameworkCore;
using Moq;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Posts.Commands.AddPostImage;
using Showcase.Application.Features.Posts.Commands.CreatePost;
using Showcase.Application.Features.Posts.Commands.DeletePost;
using Showcase.Application.Features.Posts.Commands.GetPostImageUploadUrl;
using Showcase.Application.Features.Posts.Commands.PublishPost;
using Showcase.Application.Features.Posts.Commands.RemovePostImage;
using Showcase.Application.Features.Posts.Commands.ReorderPostImages;
using Showcase.Application.Features.Posts.Commands.UnpublishPost;
using Showcase.Application.Features.Posts.Commands.UpdatePost;
using Showcase.Application.Features.Posts.Queries.GetExplorePosts;
using Showcase.Application.Features.Posts.Queries.GetMyPosts;
using Showcase.Application.Features.Posts.Queries.GetPostById;
using Showcase.Application.Features.Posts.Queries.GetProfilePosts;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;
using Showcase.Infrastructure.Data;
using Xunit;

namespace Showcase.Infrastructure.Tests;

public class PostFeatureTests
{
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IIdentityService> _identityServiceMock = new();
    private readonly Mock<IStorageService> _storageServiceMock = new();

    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    #region CreatePost Tests

    [Fact]
    public void CreatePostValidator_Should_Pass_For_Valid_Data()
    {
        var validator = new CreatePostCommandValidator();
        var command = new CreatePostCommand("My Project", "Description", "https://example.com");

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "Title is required.")]
    [InlineData("valid title", "")] // invalid url handled in next theory
    public void CreatePostValidator_Should_Validate_Title(string title, string expectedError)
    {
        var validator = new CreatePostCommandValidator();
        var command = new CreatePostCommand(title, "Description");

        var result = validator.TestValidate(command);
        if (string.IsNullOrEmpty(expectedError))
            result.ShouldNotHaveValidationErrorFor(x => x.Title);
        else
            result.ShouldHaveValidationErrorFor(x => x.Title).WithErrorMessage(expectedError);
    }

    [Fact]
    public async Task CreatePostHandler_Should_Create_Draft_Post()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new CreatePostCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new CreatePostCommand("Portfolio Project", "Desc", "https://github.com"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var created = await context.Posts.FirstOrDefaultAsync(p => p.Id == result.Value);
        Assert.NotNull(created);
        Assert.Equal("Portfolio Project", created.Title);
        Assert.Equal(PostStatus.Draft, created.Status);
        Assert.Equal(profile.Id, created.ProfileId);
    }

    #endregion

    #region UpdatePost Tests

    [Fact]
    public async Task UpdatePostHandler_Should_Update_When_Owner()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Old Title", "Old Desc");
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new UpdatePostCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new UpdatePostCommand(post.Id, "New Title", "New Desc", "https://live.com"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updated = await context.Posts.FirstAsync(p => p.Id == post.Id);
        Assert.Equal("New Title", updated.Title);
        Assert.Equal("New Desc", updated.Description);
        Assert.Equal("https://live.com", updated.ExternalUrl?.Value);
    }

    [Fact]
    public async Task UpdatePostHandler_Should_Fail_When_Not_Owner()
    {
        using var context = CreateInMemoryDbContext();
        var profile1 = new Profile("user-1", "John", "Doe");
        var profile2 = new Profile("user-2", "Jane", "Doe");
        context.Profiles.AddRange(profile1, profile2);
        var post = new Post(profile1.Id, "Title", "Desc");
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-2"); // different user

        var handler = new UpdatePostCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new UpdatePostCommand(post.Id, "Hacked Title"), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Post.UnauthorizedAccess", result.Error.Code);
    }

    #endregion

    #region Publish & Unpublish Tests

    [Fact]
    public async Task PublishPostHandler_Should_Fail_When_Post_Has_No_Images()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Empty Post");
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new PublishPostCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new PublishPostCommand(post.Id), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Post.CannotPublishEmptyPost", result.Error.Code);
    }

    [Fact]
    public async Task PublishPostHandler_Should_Succeed_When_Post_Has_At_Least_One_Image()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Valid Post");
        post.AddImage(StorageKey.Create("posts/img1.png").Value);
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new PublishPostCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new PublishPostCommand(post.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updated = await context.Posts.FirstAsync(p => p.Id == post.Id);
        Assert.Equal(PostStatus.Published, updated.Status);
        Assert.NotNull(updated.PublishedAt);
    }

    [Fact]
    public async Task UnpublishPostHandler_Should_Set_Status_To_Unpublished()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Post");
        post.AddImage(StorageKey.Create("posts/img1.png").Value);
        post.Publish();
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new UnpublishPostCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new UnpublishPostCommand(post.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updated = await context.Posts.FirstAsync(p => p.Id == post.Id);
        Assert.Equal(PostStatus.Unpublished, updated.Status);
    }

    #endregion

    #region DeletePost Tests

    [Fact]
    public async Task DeletePostHandler_Should_Remove_Post_And_Delete_Images_From_Storage()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Post To Delete");
        post.AddImage(StorageKey.Create("posts/post-1/img1.png").Value);
        post.AddImage(StorageKey.Create("posts/post-1/img2.png").Value);
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _storageServiceMock
            .Setup(x => x.DeleteAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new DeletePostCommandHandler(context, _currentUserServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new DeletePostCommand(post.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var remainingPost = await context.Posts.FirstOrDefaultAsync(p => p.Id == post.Id);
        Assert.Null(remainingPost);

        _storageServiceMock.Verify(x => x.DeleteAsync("posts/post-1/img1.png", It.IsAny<CancellationToken>()), Times.Once);
        _storageServiceMock.Verify(x => x.DeleteAsync("posts/post-1/img2.png", It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region PostImage Tests

    [Theory]
    [InlineData("image/jpeg", 1024, true)]
    [InlineData("image/png", 5 * 1024 * 1024, true)]
    [InlineData("application/json", 1024, false)]
    [InlineData("image/jpeg", 11 * 1024 * 1024, false)]
    public void GetPostImageUploadUrlValidator_Should_Validate(string contentType, long size, bool expectedValid)
    {
        var validator = new GetPostImageUploadUrlCommandValidator();
        var command = new GetPostImageUploadUrlCommand(Guid.NewGuid(), contentType, size);

        var result = validator.TestValidate(command);
        Assert.Equal(expectedValid, result.IsValid);
    }

    [Fact]
    public async Task AddPostImageHandler_Should_Attach_Image_To_Post()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Post");
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _storageServiceMock
            .Setup(x => x.GetPublicUrl("posts/post-1/img.png"))
            .Returns("https://cdn.example.com/posts/post-1/img.png");

        var handler = new AddPostImageCommandHandler(context, _currentUserServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new AddPostImageCommand(post.Id, "posts/post-1/img.png", 0), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("posts/post-1/img.png", result.Value.StorageKey);
        Assert.Equal("https://cdn.example.com/posts/post-1/img.png", result.Value.Url);

        var updatedPost = await context.Posts.Include(p => p.Images).FirstAsync(p => p.Id == post.Id);
        Assert.Single(updatedPost.Images);
    }

    [Fact]
    public async Task RemovePostImageHandler_Should_Prevent_Removing_Last_Image_When_Published()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Published Post");
        var img = post.AddImage(StorageKey.Create("posts/img1.png").Value);
        post.Publish();
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new RemovePostImageCommandHandler(context, _currentUserServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new RemovePostImageCommand(post.Id, img.Id), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Post.CannotPublishEmptyPost", result.Error.Code);
    }

    [Fact]
    public async Task ReorderPostImagesHandler_Should_Update_Display_Orders()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Post");
        var img1 = post.AddImage(StorageKey.Create("posts/img1.png").Value, 0);
        var img2 = post.AddImage(StorageKey.Create("posts/img2.png").Value, 1);
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");

        var handler = new ReorderPostImagesCommandHandler(context, _currentUserServiceMock.Object);
        var result = await handler.Handle(new ReorderPostImagesCommand(post.Id, new List<ReorderPostImageItem>
        {
            new(img1.Id, 5),
            new(img2.Id, 2)
        }), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updated = await context.Posts.Include(p => p.Images).FirstAsync(p => p.Id == post.Id);
        Assert.Equal(5, updated.Images.First(i => i.Id == img1.Id).DisplayOrder);
        Assert.Equal(2, updated.Images.First(i => i.Id == img2.Id).DisplayOrder);
    }

    #endregion

    #region Query Tests

    [Fact]
    public async Task GetPostById_Should_Return_NotFound_To_Strangers_When_Draft()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("creator-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Secret Draft");
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("stranger-user");

        var handler = new GetPostByIdQueryHandler(context, _currentUserServiceMock.Object, _identityServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new GetPostByIdQuery(post.Id), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Post.NotFound", result.Error.Code);
    }

    [Fact]
    public async Task GetPostById_Should_Return_Published_Post_To_Anyone()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("creator-1", "John", "Doe");
        context.Profiles.Add(profile);
        var post = new Post(profile.Id, "Public Work", "Great project", Url.Create("https://github.com").Value);
        post.AddImage(StorageKey.Create("posts/img.png").Value);
        post.Publish();
        context.Posts.Add(post);
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns((string?)null); // Anonymous visitor
        _identityServiceMock
            .Setup(x => x.GetUserByIdAsync("creator-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserIdentityDetails("creator-1", "john@test.com", "johndoe", new List<string>()));
        _storageServiceMock
            .Setup(x => x.GetPublicUrl("posts/img.png"))
            .Returns("https://cdn.example.com/posts/img.png");

        var handler = new GetPostByIdQueryHandler(context, _currentUserServiceMock.Object, _identityServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new GetPostByIdQuery(post.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var resp = result.Value;
        Assert.Equal("Public Work", resp.Title);
        Assert.Equal("Published", resp.Status);
        Assert.NotNull(resp.Creator);
        Assert.Equal("johndoe", resp.Creator.Username);
        Assert.Single(resp.Images);
    }

    [Fact]
    public async Task GetMyPosts_Should_Return_Paginated_User_Posts()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("user-1", "John", "Doe");
        context.Profiles.Add(profile);

        for (int i = 1; i <= 5; i++)
        {
            var p = new Post(profile.Id, $"Post {i}");
            context.Posts.Add(p);
        }
        await context.SaveChangesAsync();

        _currentUserServiceMock.Setup(x => x.UserId).Returns("user-1");
        _identityServiceMock
            .Setup(x => x.GetUserByIdAsync("user-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserIdentityDetails("user-1", "john@test.com", "johndoe", new List<string>()));

        var handler = new GetMyPostsQueryHandler(context, _currentUserServiceMock.Object, _identityServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new GetMyPostsQuery(PageNumber: 1, PageSize: 3), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var list = result.Value;
        Assert.Equal(5, list.TotalCount);
        Assert.Equal(3, list.Items.Count);
        Assert.Equal(2, list.TotalPages);
        Assert.True(list.HasNextPage);
        Assert.False(list.HasPreviousPage);
    }

    [Fact]
    public async Task GetExplorePosts_Should_Filter_And_Return_Published_Only()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("creator-1", "John", "Doe");
        context.Profiles.Add(profile);

        var pubPost = new Post(profile.Id, "Published Art", "An illustration");
        pubPost.AddImage(StorageKey.Create("posts/art.png").Value);
        pubPost.Publish();

        var draftPost = new Post(profile.Id, "Draft Art", "Not ready");

        context.Posts.AddRange(pubPost, draftPost);
        await context.SaveChangesAsync();

        _identityServiceMock
            .Setup(x => x.GetUserByIdAsync("creator-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserIdentityDetails("creator-1", "john@test.com", "johndoe", new List<string>()));
        _storageServiceMock
            .Setup(x => x.GetPublicUrl("posts/art.png"))
            .Returns("https://cdn.example.com/posts/art.png");

        var handler = new GetExplorePostsQueryHandler(context, _identityServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new GetExplorePostsQuery(Search: "illustration"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var list = result.Value;
        Assert.Single(list.Items);
        Assert.Equal("Published Art", list.Items.First().Title);
        Assert.Equal("https://cdn.example.com/posts/art.png", list.Items.First().ThumbnailUrl);
    }

    [Fact]
    public async Task GetProfilePosts_Should_Return_Creator_Published_Posts()
    {
        using var context = CreateInMemoryDbContext();
        var profile = new Profile("creator-1", "John", "Doe");
        context.Profiles.Add(profile);

        var pubPost = new Post(profile.Id, "Live Project");
        pubPost.AddImage(StorageKey.Create("posts/live.png").Value);
        pubPost.Publish();

        context.Posts.Add(pubPost);
        await context.SaveChangesAsync();

        _identityServiceMock
            .Setup(x => x.GetUserByUsernameAsync("johndoe", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserIdentityDetails("creator-1", "john@test.com", "johndoe", new List<string>()));

        var handler = new GetProfilePostsQueryHandler(context, _identityServiceMock.Object, _storageServiceMock.Object);
        var result = await handler.Handle(new GetProfilePostsQuery("johndoe"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.Items);
        Assert.Equal("Live Project", result.Value.Items.First().Title);
    }

    #endregion
}
