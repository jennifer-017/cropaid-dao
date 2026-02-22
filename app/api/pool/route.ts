import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { getOrCreatePool, poolBalance } from "@/lib/dao/pool";

export async function GET() {
  try {
    await requireAuth();
    await connectDb();
    const pool = await getOrCreatePool();
    const balance = poolBalance(pool.totalStaked, pool.totalPaidOut);
    return NextResponse.json({
      pool: {
        totalStaked: pool.totalStaked,
        totalPaidOut: pool.totalPaidOut,
        balance,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: err?.status ?? 500 });
  }
}
