import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "../env";
import type { Role } from "./roles";

export type JwtClaims = {
  sub: string;
  role: Role;
};

const COOKIE_NAME = "cropaid_token";

export function signJwt(claims: JwtClaims) {
  const secret: Secret = env.JWT_SECRET;
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(claims, secret, options);
}

export function verifyJwt(token: string): JwtClaims {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid token payload");
  }
  const { sub, role } = payload as Partial<JwtClaims>;
  if (!sub || !role) throw new Error("Missing token claims");
  return { sub, role } as JwtClaims;
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export function getAuthTokenFromCookies() {
  return cookies().get(COOKIE_NAME)?.value ?? null;
}
