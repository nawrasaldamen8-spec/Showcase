import type { UserAccount } from "../types/index.ts";

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "usr_elena_vance",
    email: "elena.vance@studio-vance.design",
    username: "elena_v",
    passwordHash: "Password123!",
    profileId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    roles: ["Creator"],
  },
  {
    id: "usr_marcus_thorne",
    email: "marcus@thornestudio.io",
    username: "marcus_k",
    passwordHash: "Password123!",
    profileId: "4fa85f64-5717-4562-b3fc-2c963f66afa7",
    roles: ["Creator"],
  },
  {
    id: "usr_sophia_chen",
    email: "sophia@chen-editorial.com",
    username: "sophia_chen",
    passwordHash: "Password123!",
    profileId: "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    roles: ["Creator"],
  },
  {
    id: "usr_tariq_mansour",
    email: "tariq@mansour.dev",
    username: "tariq_dev",
    passwordHash: "Password123!",
    profileId: "6fa85f64-5717-4562-b3fc-2c963f66afa9",
    roles: ["Creator"],
  },
  {
    id: "usr_maya_lin",
    email: "maya@lin-ceramics.com",
    username: "maya_lin",
    passwordHash: "Password123!",
    profileId: "7fa85f64-5717-4562-b3fc-2c963f66afb0",
    roles: ["Creator"],
  },
];
