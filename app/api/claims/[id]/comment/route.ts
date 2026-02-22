import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { Claim } from "@/models/Claim";

const schema = z.object({
  message: z.string().min(1).max(500),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const authed = await requireAuth();
    const body = schema.parse(await req.json());

    await connectDb();
    const claim = await Claim.findById(params.id);
    if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });

    claim.comments.push({
      userId: authed.id,
      userName: authed.name,
      message: body.message,
      createdAt: new Date(),
    });

    await claim.save();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Comment failed" }, { status: err?.status ?? 400 });
  }
}
