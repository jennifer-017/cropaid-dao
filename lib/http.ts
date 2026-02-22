export async function readJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => null)) as T | null;
  if (!res.ok) {
    const maybeAny = data as any;
    const msg = (maybeAny && typeof maybeAny === "object" && "error" in maybeAny && maybeAny.error) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  if (!data) throw new Error("Invalid JSON response");
  return data;
}
