"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "../../lib/i18n/provider";

export default function RegisterPage() {
  const { t } = useI18n();
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Farmer" | "Voter" | "Admin">("Farmer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.createAccount")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("auth.namePlaceholder")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t("auth.role")}</Label>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="Farmer">{t("roles.farmer")}</option>
              <option value="Voter">{t("roles.voter")}</option>
              <option value="Admin">{t("roles.admin")}</option>
            </select>
            <div className="text-xs text-slate-500">{t("auth.roleDevOnlyNote")}</div>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                await register({ email, name, password, role });
                router.push("/");
              } catch (e: any) {
                setError(e?.message ?? t("auth.registerFailed"));
              } finally {
                setLoading(false);
              }
            }}
          >
            {t("auth.register")}
          </Button>

          <div className="text-sm text-slate-600">
            {t("auth.alreadyHaveAccount")} {" "}
            <Link className="underline" href="/login">
              {t("auth.login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
