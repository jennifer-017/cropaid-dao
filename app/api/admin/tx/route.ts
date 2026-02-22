import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { TxLog } from "@/models/TxLog";

export async function GET() {
  try {
    await requireAuth(["Admin"]);
    await connectDb();
    const items = await TxLog.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: err?.status ?? 500 });
  }
}
