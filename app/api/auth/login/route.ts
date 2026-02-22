import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { setAuthCookie, signJwt } from "@/lib/auth/jwt";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    await connectDb();

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signJwt({ sub: String(user._id), role: user.role });
    setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Login failed" }, { status: 400 });
  }
}
