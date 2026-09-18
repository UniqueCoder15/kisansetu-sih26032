import { Request, Response } from "express";
import { isDBConnected } from "../config/db.js";

export const getHealthStatus = (req: Request, res: Response): void => {
  const dbStatus = isDBConnected() ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    server: "up",
    database: dbStatus,
  });
};
