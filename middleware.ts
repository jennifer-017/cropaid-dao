import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "cropaid_token";

type Role = "Farmer" | "Voter" | "Admin";

function requiredRoleForPath(pathname: string): Role | null {
  if (pathname.startsWith("/farmer")) return "Farmer";
  if (pathname.startsWith("/voter")) return "Voter";
  if (pathname.startsWith("/admin")) return "Admin";
  return null;
}

async function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");

  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  const sub = payload.sub;
  const role = payload.role as Role | undefined;
  if (!sub || !role) throw new Error("Invalid token");
  return { sub: String(sub), role };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requiredRole = requiredRoleForPath(pathname);
  if (!requiredRole) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { role } = await verifyToken(token);
    if (role !== requiredRole && role !== "Admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/farmer/:path*", "/voter/:path*", "/admin/:path*"],
};
