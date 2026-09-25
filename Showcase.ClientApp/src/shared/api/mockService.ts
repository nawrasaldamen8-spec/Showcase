import { MockApiError, mockDb } from "./mockDb.ts";
import { mockAuthService } from "./mockService.auth.ts";
import { mockPostsService } from "./mockService.posts.ts";
import { mockProfileService } from "./mockService.profile.ts";

export { MockApiError };

export const mockService = {
  // Database & State Management
  loadDb: () => mockDb.loadDb(),
  saveDb: (db: Parameters<typeof mockDb.saveDb>[0]) => mockDb.saveDb(db),
  resetDatabase: () => mockDb.resetDatabase(),
  getActivePersona: () => mockDb.getActivePersona(),
  setActivePersona: (p: Parameters<typeof mockDb.setActivePersona>[0]) => mockDb.setActivePersona(p),
  getStoredAuth: () => mockDb.getStoredAuth(),
  setStoredAuth: (a: Parameters<typeof mockDb.setStoredAuth>[0]) => mockDb.setStoredAuth(a),

  // Domain Services
  ...mockAuthService,
  ...mockProfileService,
  ...mockPostsService,
};
