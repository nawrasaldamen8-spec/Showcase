import { mockPostsCommandService } from "./mockService.posts.command.ts";
import { mockPostsQueryService } from "./mockService.posts.query.ts";

export const mockPostsService = {
  ...mockPostsQueryService,
  ...mockPostsCommandService,
};
