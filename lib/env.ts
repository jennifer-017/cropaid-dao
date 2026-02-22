import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  UPLOAD_DIR: z.string().default("public/uploads"),
  NEXT_PUBLIC_APP_NAME: z.string().default("CropAid DAO"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
    UPLOAD_DIR: process.env.UPLOAD_DIR ?? "public/uploads",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "CropAid DAO",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment variables: ${message}`);
  }

  cached = parsed.data;
  return cached;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, prop) {
    const data = loadEnv();
    if (typeof prop === "string") return (data as any)[prop];
    return undefined;
  },
});
