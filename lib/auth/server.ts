import { connectDb } from "@/lib/db";
import { getAuthTokenFromCookies, verifyJwt } from "@/lib/auth/jwt";
import { User } from "@/models/User";
import type { Role } from "@/lib/auth/roles";

export type AuthedUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  stakeAmount: number;
};

export async function getAuthUser(): Promise<AuthedUser | null> {
  const token = getAuthTokenFromCookies();
  if (!token) return null;

  const claims = verifyJwt(token);
  await connectDb();

  const user = await User.findById(claims.sub).lean();
  if (!user) return null;

  return {
    id: String((user as any)._id),
    email: user.email,
    name: user.name,
    role: user.role,
    stakeAmount: user.stakeAmount,
  };
}

export async function requireAuth(allowedRoles?: Role[]) {
  const user = await getAuthUser();
  if (!user) {
    const err = new Error("Unauthorized");
    (err as any).status = 401;
    throw err;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const err = new Error("Forbidden");
    (err as any).status = 403;
    throw err;
  }
  return user;
}
