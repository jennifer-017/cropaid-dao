"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useI18n } from "../lib/i18n/provider";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <h1 className="text-2xl font-semibold sm:text-3xl">{t("app.name")}</h1>
        <p className="text-sm text-slate-600 sm:text-base">
          A decentralized crop insurance fund governed by farming communities — fast, transparent disaster relief via DAO voting (MVP simulation).
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/farmer">
            <Button className="w-full sm:w-auto">Open Farmer Dashboard</Button>
          </Link>
          <Link href="/voter">
            <Button variant="secondary" className="w-full sm:w-auto">
              Open DAO Voting Portal
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="w-full sm:w-auto">
              Open Admin Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stake → Voting Power</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Stake into the pool to gain voting power and help the community approve relief faster.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Claims + Photo Evidence</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Farmers submit claims with evidence. The DAO votes transparently with a simulated on-chain log.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Relief Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Admin view of pool usage, regional claim clusters, and response metrics for real-world deployment.
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        Demo tip: create accounts for Farmer, Voter, and Admin from the Register page (role selection is enabled in dev).
      </div>
    </div>
  );
}