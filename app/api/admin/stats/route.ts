import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { Claim } from "@/models/Claim";
import { User } from "@/models/User";
import { Pool } from "@/models/Pool";
import { coordsForRegion } from "@/utils/regions";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    await requireAuth(["Admin"]);
    await connectDb();

    const pool = await Pool.findOne({ key: "singleton" }).lean();
    const totalStaked = pool?.totalStaked ?? 0;
    const totalPaidOut = pool?.totalPaidOut ?? 0;
    const balance = Math.max(0, totalStaked - totalPaidOut);

    const totalClaims = await Claim.countDocuments({});

    const resolved = await Claim.find({ resolvedAt: { $exists: true } }).select({ submittedAt: 1, resolvedAt: 1 }).lean();
    const avgResponseMs =
      resolved.length === 0
        ? 0
        : Math.round(
            resolved.reduce((a: number, c: any) => a + (new Date(c.resolvedAt).getTime() - new Date(c.submittedAt).getTime()), 0) /
              resolved.length
          );

    const avgResponseHours = Math.round((avgResponseMs / (1000 * 60 * 60)) * 10) / 10;

    // Active voters: unique users who voted in last 30 days.
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentClaims = await Claim.find({ "votes.createdAt": { $gte: since } }).select({ votes: 1 }).lean();
    const voterIds = new Set<string>();
    for (const c of recentClaims as any[]) {
      for (const v of c.votes ?? []) {
        if (v.createdAt && new Date(v.createdAt) >= since) voterIds.add(String(v.userId));
      }
    }
    const activeVoters = voterIds.size;

    // Claims over time (last 14 days)
    const days: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: dayKey(d), count: 0 });
    }

    const recentAllClaims = await Claim.find({ createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } })
      .select({ createdAt: 1 })
      .lean();
    const bucket = new Map<string, number>(days.map((d) => [d.date, 0] as [string, number]));
    for (const c of recentAllClaims as any[]) {
      const k = dayKey(new Date(c.createdAt));
      if (bucket.has(k)) bucket.set(k, (bucket.get(k) ?? 0) + 1);
    }
    const claimsOverTime = days.map((d) => ({ date: d.date, count: bucket.get(d.date) ?? 0 }));

    // Pool usage chart
    const poolUsage = [
      { name: "Paid Out", value: totalPaidOut },
      { name: "Remaining", value: balance },
    ];

    // Regional claims map
    const byRegionAgg = await Claim.aggregate([
      { $group: { _id: "$region", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const regionalClaims = byRegionAgg.map((r: any) => ({
      region: String(r._id),
      count: Number(r.count),
      ...coordsForRegion(String(r._id)),
    }));

    const farmers = await User.countDocuments({ role: "Farmer" });
    const voters = await User.countDocuments({ role: "Voter" });

    return NextResponse.json({
      pool: { totalStaked, totalPaidOut, balance },
      stats: {
        totalClaims,
        activeVoters,
        avgResponseHours,
        users: { farmers, voters },
      },
      charts: {
        poolUsage,
        claimsOverTime,
      },
      map: {
        regionalClaims,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: err?.status ?? 500 });
  }
}
