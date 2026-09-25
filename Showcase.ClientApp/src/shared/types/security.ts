export interface UserAccount {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  profileId: string;
  roles: string[];
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
