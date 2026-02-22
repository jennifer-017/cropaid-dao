import crypto from "crypto";
import type { VoteChoice } from "@/models/Claim";

export function simulateTxHash() {
  return "0x" + crypto.randomBytes(20).toString("hex");
}

export function votingPowerFromStake(stakeAmount: number) {
  return Math.max(0, Math.floor(stakeAmount));
}

export function tallyVotes(votes: Array<{ choice: VoteChoice; votingPower: number }>) {
  const approve = votes.filter((v) => v.choice === "Approve").reduce((a, v) => a + v.votingPower, 0);
  const reject = votes.filter((v) => v.choice === "Reject").reduce((a, v) => a + v.votingPower, 0);
  const total = approve + reject;
  const approvePct = total === 0 ? 0 : Math.round((approve / total) * 100);
  const rejectPct = total === 0 ? 0 : 100 - approvePct;
  return { approve, reject, total, approvePct, rejectPct };
}
