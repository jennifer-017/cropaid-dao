"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Input } from "../../components/ui/input";
import { useI18n } from "../../lib/i18n/provider";

async function fetcher(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function tally(votes: any[]) {
  const approve = votes.filter((v) => v.choice === "Approve").reduce((a, v) => a + (v.votingPower ?? 0), 0);
  const reject = votes.filter((v) => v.choice === "Reject").reduce((a, v) => a + (v.votingPower ?? 0), 0);
  const total = approve + reject;
  const approvePct = total === 0 ? 0 : Math.round((approve / total) * 100);
  const rejectPct = total === 0 ? 0 : 100 - approvePct;
  return { approve, reject, total, approvePct, rejectPct };
}

function statusLabel(status: string, t: (key: string) => string) {
  if (status === "Approved") return t("claims.approved");
  if (status === "Rejected") return t("claims.rejected");
  if (status === "Voting") return t("claims.voting");
  return t("claims.pending");
}

export default function VotingPortal() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: claimsData, mutate: mutateClaims } = useSWR("/api/claims", fetcher, { refreshInterval: 5000 });
  const { data: poolData } = useSWR("/api/pool", fetcher, { refreshInterval: 5000 });

  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const claims = (claimsData?.claims ?? []) as any[];
  const pending = claims.filter((c) => c.status === "Pending" || c.status === "Voting");

  const votingPower = useMemo(() => user?.stakeAmount ?? 0, [user?.stakeAmount]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("voting.votingPower")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{votingPower}</div>
              <div className="text-sm text-slate-600">{t("voting.votingPowerDescription")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.poolBalance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{poolData?.pool?.balance ?? 0}</div>
              <div className="text-sm text-slate-600">
                {t("pool.totalStaked")}: {poolData?.pool?.totalStaked ?? 0}
              </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("voting.pendingClaims")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <div className="text-sm text-slate-600">{t("claims.nonePending")}</div>
          ) : (
            pending.map((c) => {
              const tv = tally(c.votes ?? []);
              return (
                <div key={String(c._id)} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-sm font-medium">
                        {c.region} • {c.cropType} • ₹{c.requestedAmount}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t("claim.farmer")}: {c.farmerName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.status === "Voting" ? "info" : "warning"}>{statusLabel(c.status, t)}</Badge>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const res = await fetch(`/api/claims/${c._id}/vote`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ choice: "Approve" }),
                          });
                          if (res.ok) await mutateClaims();
                        }}
                      >
                        {t("voting.approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          const res = await fetch(`/api/claims/${c._id}/vote`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ choice: "Reject" }),
                          });
                          if (res.ok) await mutateClaims();
                        }}
                      >
                        {t("voting.reject")}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-slate-600">
                      {t("voting.approve")}: {tv.approvePct}% • {t("voting.reject")}: {tv.rejectPct}% • {t("voting.totalPower")}: {tv.total}
                    </div>
                    <Progress value={tv.approvePct} />
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-medium">{t("voting.comments")}</div>
                    <div className="mt-2 space-y-2">
                      {(c.comments ?? []).length === 0 ? (
                        <div className="text-sm text-slate-600">{t("comments.empty")}</div>
                      ) : (
                        (c.comments as any[]).slice(-3).map((cm, idx) => (
                          <div key={idx} className="rounded-lg bg-slate-50 p-2 text-sm">
                            <div className="text-xs text-slate-500">{cm.userName}</div>
                            <div>{cm.message}</div>
                          </div>
                        ))
                      )}

                      <div className="flex gap-2">
                        <Input
                          value={commentDraft[String(c._id)] ?? ""}
                          onChange={(e) => setCommentDraft((s) => ({ ...s, [String(c._id)]: e.target.value }))}
                          placeholder={t("comments.addPlaceholder")}
                        />
                        <Button
                          variant="outline"
                          onClick={async () => {
                            const message = (commentDraft[String(c._id)] ?? "").trim();
                            if (!message) return;
                            const res = await fetch(`/api/claims/${c._id}/comment`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ message }),
                            });
                            if (res.ok) {
                              setCommentDraft((s) => ({ ...s, [String(c._id)]: "" }));
                              await mutateClaims();
                            }
                          }}
                        >
                          {t("common.send")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
