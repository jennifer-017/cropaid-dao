import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { User } from "@/models/User";
import { getOrCreatePool } from "@/lib/dao/pool";
import { simulateTxHash } from "@/lib/dao/sim";
import { TxLog } from "@/models/TxLog";

const schema = z.object({
  amount: z.number().positive().max(1_000_000),
});

export async function POST(req: Request) {
  try {
    const authed = await requireAuth();
    const body = schema.parse(await req.json());

    await connectDb();
    const user = await User.findById(authed.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const pool = await getOrCreatePool();

    user.stakeAmount += body.amount;
    await user.save();

    pool.totalStaked += body.amount;
    await pool.save();

    const txHash = simulateTxHash();
    await TxLog.create({
      txHash,
      type: "STAKE",
      actorUserId: authed.id,
      amount: body.amount,
      meta: { newStakeAmount: user.stakeAmount },
    });

    return NextResponse.json({ ok: true, txHash, stakeAmount: user.stakeAmount });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Stake failed" }, { status: err?.status ?? 400 });
  }
}
