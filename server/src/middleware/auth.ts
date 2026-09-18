import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { JwtPayloadUser } from "../types/express.js";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "error",
      message: "Authentication required. Please provide a valid Bearer token.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || env.JWT_SECRET
    ) as JwtPayloadUser;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Invalid or expired token. Please log in again.",
    });
    return;
  }
};
