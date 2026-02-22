"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { useI18n } from "../lib/i18n/provider";
import { useAuth } from "@/hooks/useAuth";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={
        active
          ? "text-sm font-semibold text-slate-900"
          : "text-sm text-slate-600 hover:text-slate-900"
      }
    >
      {label}
    </Link>
  );
}

export function AppHeader() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold">
            {t("app.name")}
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            <NavLink href="/" label={t("nav.home")} />
            <NavLink href="/farmer" label={t("nav.farmer")} />
            <NavLink href="/voter" label={t("nav.voter")} />
            <NavLink href="/admin" label={t("nav.admin")} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              {t("nav.logout")}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => router.push("/login")}
            >
              {t("nav.login")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
