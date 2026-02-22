import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { Claim } from "@/models/Claim";
import { tallyVotes } from "@/lib/dao/sim";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await connectDb();

    const claim = await Claim.findById(params.id).lean();
    if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const tally = tallyVotes((claim as any).votes ?? []);
    return NextResponse.json({ claim, tally });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: err?.status ?? 500 });
  }
}
