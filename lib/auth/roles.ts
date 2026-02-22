export const Roles = {
  Farmer: "Farmer",
  Voter: "Voter",
  Admin: "Admin",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const ALL_ROLES: Role[] = [Roles.Farmer, Roles.Voter, Roles.Admin];
