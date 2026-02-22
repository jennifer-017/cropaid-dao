import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { setAuthCookie, signJwt } from "@/lib/auth/jwt";
import { Roles, type Role } from "@/lib/auth/roles";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const role: Role =
      process.env.NODE_ENV === "production"
        ? Roles.Farmer
        : (body.role as Role) ?? Roles.Farmer;

    await connectDb();

    const existing = await User.findOne({ email: body.email.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await User.create({
      email: body.email.toLowerCase(),
      name: body.name,
      passwordHash,
      role,
      stakeAmount: 0,
    });

    const token = signJwt({ sub: String(user._id), role: user.role });
    setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Register failed" }, { status: 400 });
  }
}
