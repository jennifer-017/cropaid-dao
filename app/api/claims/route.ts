import { NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { connectDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/server";
import { Claim } from "@/models/Claim";
import { simulateTxHash } from "@/lib/dao/sim";
import { TxLog } from "@/models/TxLog";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireAuth();
    await connectDb();

    const query = user.role === "Farmer" ? { farmerUserId: user.id } : {};
    const claims = await Claim.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ claims });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: err?.status ?? 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(["Farmer", "Admin"]);
    await connectDb();

    const form = await req.formData();

    const region = String(form.get("region") ?? "").trim();
    const cropType = String(form.get("cropType") ?? "").trim();
    const requestedAmountRaw = String(form.get("requestedAmount") ?? "").trim();

    const requestedAmount = Number(requestedAmountRaw);
    if (!region || !cropType || !Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return NextResponse.json({ error: "Invalid claim fields" }, { status: 400 });
    }

    const file = form.get("photo");

    const claim = await Claim.create({
      farmerUserId: user.id,
      farmerName: user.name,
      region,
      cropType,
      requestedAmount,
      submittedAt: new Date(),
      status: "Pending",
      votes: [],
      comments: [],
    });

    if (file && typeof file !== "string") {
      const uploadDir = env.UPLOAD_DIR;
      await mkdir(uploadDir, { recursive: true });

      const arrayBuffer = await (file as File).arrayBuffer();
      const safeName = (file as File).name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const outName = `${String(claim._id)}-${safeName}`;
      const outPath = path.join(uploadDir, outName);
      await writeFile(outPath, Buffer.from(arrayBuffer));

      claim.evidencePhotoUrl = `/uploads/${outName}`;
      await claim.save();
    }

    const txHash = simulateTxHash();
    await TxLog.create({
      txHash,
      type: "CLAIM_SUBMITTED",
      actorUserId: user.id,
      claimId: String(claim._id),
      amount: requestedAmount,
      meta: { region, cropType },
    });

    return NextResponse.json({ ok: true, claimId: String(claim._id), txHash });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Claim submit failed" }, { status: err?.status ?? 400 });
  }
}
