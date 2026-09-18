import mongoose from "mongoose";

export interface HealthCheckResult {
  status: "ok" | "degraded";
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: string;
    readyState: number;
  };
}

export const getSystemHealth = (): HealthCheckResult => {
  const dbStateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const readyState = mongoose.connection.readyState;
  const dbStatus = dbStateMap[readyState] || "unknown";

  return {
    status: readyState === 1 ? "ok" : "degraded",
    service: "kisansetu-api",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      readyState,
    },
  };
};
