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
          {t("home.tagline")}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/farmer">
            <Button className="w-full sm:w-auto">{t("home.openFarmerDashboard")}</Button>
          </Link>
          <Link href="/voter">
            <Button variant="secondary" className="w-full sm:w-auto">
              {t("home.openVoterPortal")}
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="w-full sm:w-auto">
              {t("home.openAdminDashboard")}
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("home.feature.stake.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {t("home.feature.stake.body")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("home.feature.claims.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {t("home.feature.claims.body")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("home.feature.analytics.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {t("home.feature.analytics.body")}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        {t("home.demoTip")}
      </div>
    </div>
  );
}