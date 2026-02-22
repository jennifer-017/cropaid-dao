"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "../../lib/i18n/provider";

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = useMemo(() => search.get("next") ?? "/", [search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.welcomeBack")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                await login({ email, password });
                router.push(next);
              } catch (e: any) {
                setError(e?.message ?? t("auth.loginFailed"));
              } finally {
                setLoading(false);
              }
            }}
          >
            {t("auth.login")}
          </Button>

          <div className="text-sm text-slate-600">
            {t("auth.createAccount")}?{" "}
            <Link className="underline" href="/register">
              {t("auth.register")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
