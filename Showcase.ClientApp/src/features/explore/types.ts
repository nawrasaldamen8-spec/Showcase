export const CATEGORIES = [
  'All',
  'Photography',
  'Architecture',
  'Design',
  'Typography',
] as const;

export type Category = (typeof CATEGORIES)[number];
