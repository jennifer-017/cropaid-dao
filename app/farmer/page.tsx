"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Textarea } from "../../components/ui/textarea";
import { useI18n } from "../../lib/i18n/provider";

async function fetcher(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function statusVariant(status: string) {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "danger";
  if (status === "Voting") return "info";
  return "warning";
}

function statusLabel(status: string, t: (key: string) => string) {
  if (status === "Approved") return t("claims.approved");
  if (status === "Rejected") return t("claims.rejected");
  if (status === "Voting") return t("claims.voting");
  return t("claims.pending");
}

export default function FarmerDashboard() {
  const { t } = useI18n();
  const { user, refresh } = useAuth();

  const [stakeAmount, setStakeAmount] = useState("50");
  const [claimRegion, setClaimRegion] = useState("Tamil Nadu");
  const [cropType, setCropType] = useState("Rice");
  const [requestedAmount, setRequestedAmount] = useState("250");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const { data: poolData, mutate: mutatePool } = useSWR("/api/pool", fetcher, { refreshInterval: 5000 });
  const { data: weatherData, mutate: mutateWeather } = useSWR(`/api/weather?region=${encodeURIComponent(claimRegion)}`, fetcher, {
    refreshInterval: 15000,
  });
  const { data: claimsData, mutate: mutateClaims } = useSWR("/api/claims", fetcher, { refreshInterval: 5000 });

  const insuranceLabel = useMemo(() => {
    const staked = user?.stakeAmount ?? 0;
    if (staked >= 500) return t("farmer.coverage.high");
    if (staked >= 100) return t("farmer.coverage.standard");
    if (staked > 0) return t("farmer.coverage.basic");
    return t("farmer.coverage.notStaked");
  }, [t, user?.stakeAmount]);

  const stakeProgress = useMemo(() => {
    const staked = user?.stakeAmount ?? 0;
    return Math.min(100, Math.round((staked / 500) * 100));
  }, [user?.stakeAmount]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("farmer.insuranceStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">{insuranceLabel}</div>
              <Badge variant={user?.stakeAmount ? "success" : "warning"}>
                {user?.stakeAmount ?? 0} {t("farmer.staked")}
              </Badge>
            </div>
            <Progress value={stakeProgress} />
            <div className="text-xs text-slate-500">{t("farmer.stakeTargetMaxCoverage")}: 500</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("farmer.weatherAlert")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="font-medium">{weatherData?.region ?? claimRegion}</div>
              <div className="text-slate-600">{weatherData?.message ?? t("common.loading")}</div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => mutateWeather()}>
                  {t("common.refresh")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("farmer.stakeIntoPool")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-600">
              {t("pool.balance")}: <span className="font-semibold">{poolData?.pool?.balance ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <Input value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} inputMode="numeric" />
              <Button
                onClick={async () => {
                  const amount = Number(stakeAmount);
                  if (!Number.isFinite(amount) || amount <= 0) return;
                  await fetch("/api/pool/stake", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount }),
                  });
                  await Promise.all([mutatePool(), refresh()]);
                }}
              >
                {t("pool.stake")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("farmer.submitClaim")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>{t("claim.region")}</Label>
                <Input value={claimRegion} onChange={(e) => setClaimRegion(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t("claim.crop")}</Label>
                <Input value={cropType} onChange={(e) => setCropType(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t("claim.requestedAmount")}</Label>
                <Input value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} inputMode="numeric" />
              </div>
              <div className="space-y-1">
                <Label>{t("claim.evidencePhoto")}</Label>
                <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("claim.notesOptional")}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("claim.damageDetailsPlaceholder")} />
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                const fd = new FormData();
                fd.set("region", claimRegion);
                fd.set("cropType", cropType);
                fd.set("requestedAmount", requestedAmount);
                if (notes) fd.set("notes", notes);
                if (photo) fd.set("photo", photo);

                const res = await fetch("/api/claims", { method: "POST", body: fd });
                if (!res.ok) return;
                setNotes("");
                setPhoto(null);
                await mutateClaims();
              }}
            >
              {t("common.submit")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("farmer.claimTracker")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(claimsData?.claims ?? []).length === 0 ? (
            <div className="text-sm text-slate-600">{t("claims.empty")}</div>
          ) : (
            <div className="space-y-2">
              {(claimsData.claims as any[]).map((c) => (
                <div key={String(c._id)} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <div className="text-sm font-medium">
                      {c.region} • {c.cropType} • ₹{c.requestedAmount}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t("claims.submitted")}: {new Date(c.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(c.status) as any}>{statusLabel(c.status, t)}</Badge>
                    {c.evidencePhotoUrl ? (
                      <a className="text-xs underline" href={c.evidencePhotoUrl} target="_blank" rel="noreferrer">
                        {t("claim.photo")}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
