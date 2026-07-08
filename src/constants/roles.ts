export const USER_ROLES = ["TENANT", "LANDLORD", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

