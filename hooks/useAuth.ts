"use client";

import useSWR from "swr";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "Farmer" | "Voter" | "Admin";
  stakeAmount: number;
};

async function fetcher(url: string) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useAuth() {
  const { data, error, mutate, isLoading } = useSWR<{ user: AuthUser | null }>("/api/auth/me", fetcher);

  const login = async (payload: { email: string; password: string }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Login failed");
    }
    await mutate();
  };

  const register = async (payload: { email: string; name: string; password: string; role?: string }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Register failed");
    }
    await mutate();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate();
  };

  return {
    user: data?.user ?? null,
    isLoading,
    error,
    login,
    register,
    logout,
    refresh: mutate,
  };
}
