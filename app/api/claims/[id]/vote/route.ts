import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { Claim, type VoteChoice } from "@/models/Claim";
import { User } from "@/models/User";
import { simulateTxHash, tallyVotes, votingPowerFromStake } from "@/lib/dao/sim";
import { TxLog } from "@/models/TxLog";
import { Pool } from "@/models/Pool";

const schema = z.object({
  choice: z.enum(["Approve", "Reject"]),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const authed = await requireAuth(["Voter", "Admin"]);
    const body = schema.parse(await req.json());

    await connectDb();

    const claim = await Claim.findById(params.id);
    if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (claim.status === "Approved" || claim.status === "Rejected") {
      return NextResponse.json({ error: "Claim already resolved" }, { status: 409 });
    }

    const existingVote = claim.votes.find((v) => v.userId === authed.id);
    if (existingVote) {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }

    const voter = await User.findById(authed.id).lean();
    const stake = voter?.stakeAmount ?? 0;
    const votingPower = votingPowerFromStake(stake);
    if (votingPower <= 0) {
      return NextResponse.json({ error: "No voting power (stake required)" }, { status: 400 });
    }

    if (claim.status === "Pending") {
      claim.status = "Voting";
      claim.votingStartedAt = new Date();
    }

    claim.votes.push({
      userId: authed.id,
      choice: body.choice as VoteChoice,
      votingPower,
      createdAt: new Date(),
    });

    const tally = tallyVotes(claim.votes);

    // MVP resolution rule: once total voting power >= 50, resolve by majority.
    if (tally.total >= 50) {
      if (tally.approvePct >= 60) {
        claim.status = "Approved";
        claim.resolvedAt = new Date();
      } else if (tally.rejectPct > 50) {
        claim.status = "Rejected";
        claim.resolvedAt = new Date();
      }
    }

    await claim.save();

    const txHash = simulateTxHash();
    await TxLog.create({
      txHash,
      type: "VOTE_CAST",
      actorUserId: authed.id,
      claimId: String(claim._id),
      meta: { choice: body.choice, votingPower },
    });

    if (claim.status === "Approved") {
      // Simulate payout immediately for MVP accounting.
      const pool = await Pool.findOne({ key: "singleton" });
      if (pool) {
        pool.totalPaidOut += claim.requestedAmount;
        await pool.save();
      }
      await TxLog.create({
        txHash: simulateTxHash(),
        type: "PAYOUT",
        actorUserId: authed.id,
        claimId: String(claim._id),
        amount: claim.requestedAmount,
      });
    }

    return NextResponse.json({ ok: true, tally, status: claim.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Vote failed" }, { status: err?.status ?? 400 });
  }
}
