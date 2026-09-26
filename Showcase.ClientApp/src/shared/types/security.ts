export interface UserAccount {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  profileId: string;
  roles: string[];
  phoneNumber?: string | null;
  accountNumber?: string | null;
  isVerified?: boolean;
  verificationStatus?: "none" | "pending" | "verified" | "rejected";
  featuredStatus?: "none" | "pending" | "featured" | "rejected";
  isBanned?: boolean;
  banReason?: string | null;
}

export interface UserIdentityDetails {
  id: string;
  email: string;
  userName: string;
  roles: string[];
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profileId: string;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  accountNumber?: string | null;
  isVerified?: boolean;
  verificationStatus?: "none" | "pending" | "verified" | "rejected";
  featuredStatus?: "none" | "pending" | "featured" | "rejected";
  isBanned?: boolean;
  banReason?: string | null;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiry?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface ChangeUsernameRequest {
  newUsername: string;
  currentPassword: string;
}
