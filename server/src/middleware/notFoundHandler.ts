import { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: "error",
    error: "NOT_FOUND",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
};
