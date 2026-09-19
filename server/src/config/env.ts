import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/kisansetu"),
  JWT_SECRET: z.string().default("kisansetu_jwt_super_secret_key_2026"),
  CLIENT_URL: z
    .string()
    .transform((val) => val.trim().replace(/[\r\n\0]/g, ""))
    .default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
