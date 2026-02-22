import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

import { I18nProvider } from "../lib/i18n/provider";
import { AppHeader } from "../components/AppHeader";

export const metadata: Metadata = {
  title: "CropAid DAO",
  description:
    "A decentralized crop insurance fund governed by farming communities, enabling fast and transparent disaster relief through DAO voting and smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900">
        <I18nProvider>
          <AppHeader />
          <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
