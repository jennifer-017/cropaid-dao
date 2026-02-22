"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useI18n } from "../../lib/i18n/provider";
import { RegionalClaimsMap } from "../../components/admin/RegionalClaimsMap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

async function fetcher(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function AdminDashboard() {
  const { t } = useI18n();
  const { data: statsData } = useSWR("/api/admin/stats", fetcher, { refreshInterval: 5000 });
  const { data: txData } = useSWR("/api/admin/tx", fetcher, { refreshInterval: 5000 });

  const poolUsage = statsData?.charts?.poolUsage ?? [];
  const claimsOverTime = statsData?.charts?.claimsOverTime ?? [];
  const regionalClaims = statsData?.map?.regionalClaims ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.reliefDashboard")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">{t("admin.poolBalance")}</div>
            <div className="text-xl font-semibold">{statsData?.pool?.balance ?? 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">{t("admin.activeVoters")}</div>
            <div className="text-xl font-semibold">{statsData?.stats?.activeVoters ?? 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">{t("admin.avgResponseHours")}</div>
            <div className="text-xl font-semibold">{statsData?.stats?.avgResponseHours ?? 0}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">{t("admin.totalClaims")}</div>
            <div className="text-xl font-semibold">{statsData?.stats?.totalClaims ?? 0}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.regionalClaimsMap")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RegionalClaimsMap points={regionalClaims} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.poolUsage")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72 text-slate-900">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={poolUsage} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {poolUsage.map((_: any, idx: number) => (
                    <Cell key={idx} fill="currentColor" fillOpacity={idx === 0 ? 1 : 0.25} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.claimsOverTime")}</CardTitle>
        </CardHeader>
        <CardContent className="h-72 text-slate-900">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={claimsOverTime} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="currentColor" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.txLog")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(txData?.items ?? []).length === 0 ? (
            <div className="text-sm text-slate-600">{t("tx.empty")}</div>
          ) : (
            (txData.items as any[]).map((tx) => (
              <div key={tx.txHash} className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center">
                <div>
                  <div className="text-sm font-medium">{tx.type}</div>
                  <div className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  {typeof tx.amount === "number" ? <Badge variant="default">{tx.amount}</Badge> : null}
                  <span className="text-xs text-slate-500">{String(tx.txHash).slice(0, 10)}…</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
