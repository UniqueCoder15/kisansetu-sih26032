import { CorsOptions } from "cors";
import { env } from "./env.js";

/**
 * Parses and sanitizes allowed origins from process.env.CLIENT_URL.
 * Handles comma-separated values, newlines, control characters, and trailing slashes.
 */
export const getCorsOrigins = (): string[] => {
  const rawClientUrl = env.CLIENT_URL || "http://localhost:3000";
  const parsedOrigins = rawClientUrl
    .split(",")
    .map((url) => url.trim().replace(/[\r\n\0]/g, "").replace(/\/+$/, ""))
    .filter((url) => url.length > 0);

  const defaultOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://localhost:5001",
  ];

  return Array.from(new Set([...parsedOrigins, ...defaultOrigins]));
};

/**
 * Production-ready CORS options that prevent Node header character exceptions
 */
export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    // Allow non-browser requests with no origin (curl, Postman, server-to-server)
    if (!requestOrigin) {
      return callback(null, true);
    }

    const cleanOrigin = requestOrigin.trim().replace(/[\r\n\0]/g, "").replace(/\/+$/, "");
    const allowedOrigins = getCorsOrigins();

    const isExplicitlyAllowed = allowedOrigins.some((allowed) => {
      const cleanAllowed = allowed.replace(/\/+$/, "");
      return cleanOrigin === cleanAllowed;
    });

    if (isExplicitlyAllowed || cleanOrigin.endsWith(".onrender.com")) {
      return callback(null, true);
    }

    console.warn(`[CORS] Unlisted origin: "${cleanOrigin}". Allowed: [${allowedOrigins.join(", ")}]`);
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};
