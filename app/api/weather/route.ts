import { NextResponse } from "next/server";

const alerts = [
  { level: "info", message: "No major alerts. Conditions stable." },
  { level: "warning", message: "Heavy rainfall expected within 48 hours." },
  { level: "danger", message: "Cyclone risk detected. Prepare mitigation steps." },
  { level: "warning", message: "Heatwave likely this week. Irrigation advised." },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const region = url.searchParams.get("region") ?? "Unknown";
  const pick = alerts[Math.floor(Math.random() * alerts.length)];
  return NextResponse.json({ region, ...pick, updatedAt: new Date().toISOString() });
}
