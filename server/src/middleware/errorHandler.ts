import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;

  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    res.status(400).json({
      status: "error",
      message: `Validation failed: ${messages}`,
    });
    return;
  }

  res.status(statusCode).json({
    status: "error",
    message: err.message || "An unexpected internal error occurred",
  });
};
