import type { Post } from "../types/index.ts";
import { POSTS_SEED_1 } from "./mockData.posts.seed1.ts";
import { POSTS_SEED_2 } from "./mockData.posts.seed2.ts";
import { POSTS_SEED_3 } from "./mockData.posts.seed3.ts";
import { POSTS_SEED_4 } from "./mockData.posts.seed4.ts";

export const INITIAL_POSTS: Post[] = [
  ...POSTS_SEED_1,
  ...POSTS_SEED_2,
  ...POSTS_SEED_3,
  ...POSTS_SEED_4,
];
