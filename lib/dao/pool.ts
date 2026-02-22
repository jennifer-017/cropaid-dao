import { Pool } from "@/models/Pool";

export async function getOrCreatePool() {
  const existing = await Pool.findOne({ key: "singleton" });
  if (existing) return existing;
  return Pool.create({ key: "singleton", totalStaked: 0, totalPaidOut: 0 });
}

export function poolBalance(totalStaked: number, totalPaidOut: number) {
  return Math.max(0, totalStaked - totalPaidOut);
}
