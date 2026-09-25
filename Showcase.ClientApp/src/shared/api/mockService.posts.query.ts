import {
  PostStatus,
  type ExplorePostResponse,
  type PaginatedList,
  type Post,
  type PostDetailsResponse,
  type PostSummaryResponse,
  type Profile,
} from "../types/index.ts";
import { MockApiError, mockDb, paginateList, simulateNetworkLatency } from "./mockDb.ts";

function mapPostSummary(post: Post, creator?: Profile | null): PostSummaryResponse {
  const sortedImages = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder);
  const firstImage = sortedImages[0];
  return {
    id: post.id,
    profileId: post.profileId,
    title: post.title,
    description: post.description,
    externalUrl: post.externalUrl,
    status: post.status,
    tags: post.tags,
    createdAt: post.createdAt,
    publishedAt: post.publishedAt,
    thumbnailUrl: firstImage ? firstImage.url : null,
    imageCount: post.images.length,
    creator: creator
      ? {
          profileId: creator.id,
          username: creator.username,
          firstName: creator.firstName,
          lastName: creator.lastName,
          avatarUrl: creator.avatarUrl,
        }
      : null,
  };
}

export const mockPostsQueryService = {
  async getExplorePosts(
    search?: string,
    pageNumber = 1,
    pageSize = 12,
    category?: string,
  ): Promise<PaginatedList<ExplorePostResponse>> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();

    let items = db.posts.filter((p) => p.status === PostStatus.Published);

    if (category && category.trim() && category.trim().toLowerCase() !== "all") {
      const cat = category.trim().toLowerCase();
      items = items.filter((post) => {
        const tagMatch = post.tags?.some((t) => t.toLowerCase().includes(cat));
        const titleMatch = post.title.toLowerCase().includes(cat);
        const descMatch = post.description.toLowerCase().includes(cat);
        return Boolean(tagMatch) || titleMatch || descMatch;
      });
    }

    if (search && search.trim()) {
      const query = search.trim().toLowerCase();
      items = items.filter((post) => {
        const titleMatch = post.title.toLowerCase().includes(query);
        const descMatch = post.description.toLowerCase().includes(query);
        const tagMatch = post.tags?.some((t) => t.toLowerCase().includes(query));

        const creator = db.profiles.find((p) => p.id === post.profileId);
        const creatorMatch = creator
          ? `${creator.firstName} ${creator.lastName} ${creator.username}`.toLowerCase().includes(query)
          : false;

        return titleMatch || descMatch || Boolean(tagMatch) || creatorMatch;
      });
    }

    items.sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.createdAt).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    const mappedItems: ExplorePostResponse[] = items.map((post) => {
      const creator = db.profiles.find((p) => p.id === post.profileId);
      return mapPostSummary(post, creator);
    });

    return paginateList(mappedItems, pageNumber, pageSize);
  },

  async getPostById(id: string): Promise<PostDetailsResponse> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();

    const post = db.posts.find((p) => p.id === id);
    if (!post) {
      throw new MockApiError(404, "Post.NotFound", `Post with ID "${id}" was not found.`);
    }

    const creator = db.profiles.find((p) => p.id === post.profileId);

    if (post.status !== PostStatus.Published) {
      let isOwner = false;
      try {
        const { profile } = mockDb.getAuthenticatedUser(db);
        if (profile.id === post.profileId) {
          isOwner = true;
        }
      } catch {
        isOwner = false;
      }

      if (!isOwner) {
        throw new MockApiError(404, "Post.NotFound", `Post with ID "${id}" was not found.`);
      }
    }

    const sortedImages = [...post.images].sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      id: post.id,
      profileId: post.profileId,
      title: post.title,
      description: post.description,
      externalUrl: post.externalUrl,
      status: post.status,
      tags: post.tags,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      images: sortedImages.map((img) => ({
        id: img.id,
        storageKey: img.storageKey,
        url: img.url,
        displayOrder: img.displayOrder,
      })),
      creator: creator
        ? {
            profileId: creator.id,
            username: creator.username,
            firstName: creator.firstName,
            lastName: creator.lastName,
            avatarUrl: creator.avatarUrl,
            bio: creator.bio,
          }
        : null,
    };
  },

  async getProfilePosts(
    username: string,
    pageNumber = 1,
    pageSize = 12,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();

    const profile = db.profiles.find((p) => p.username.toLowerCase() === username.trim().toLowerCase());
    if (!profile) {
      throw new MockApiError(404, "Profile.NotFound", `Profile not found for username "${username}".`);
    }

    const profilePosts = db.posts
      .filter((p) => p.profileId === profile.id && p.status === PostStatus.Published)
      .sort((a, b) => {
        const timeA = new Date(a.publishedAt || a.createdAt).getTime();
        const timeB = new Date(b.publishedAt || b.createdAt).getTime();
        return timeB - timeA;
      });

    const mappedItems: PostSummaryResponse[] = profilePosts.map((post) => mapPostSummary(post, profile));
    return paginateList(mappedItems, pageNumber, pageSize);
  },

  async getCreatorPosts(
    username: string,
    pageNumber = 1,
    pageSize = 12,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    return this.getProfilePosts(username, pageNumber, pageSize);
  },

  async getMyPosts(
    status?: PostStatus | "all",
    pageNumber = 1,
    pageSize = 10,
  ): Promise<PaginatedList<PostSummaryResponse>> {
    await simulateNetworkLatency();
    const db = mockDb.loadDb();
    const { profile } = mockDb.getAuthenticatedUser(db);

    let items = db.posts.filter((p) => p.profileId === profile.id);

    if (status !== undefined && status !== "all") {
      items = items.filter((p) => p.status === status);
    }

    items.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    const mappedItems: PostSummaryResponse[] = items.map((post) => mapPostSummary(post, profile));
    return paginateList(mappedItems, pageNumber, pageSize);
  },
};
