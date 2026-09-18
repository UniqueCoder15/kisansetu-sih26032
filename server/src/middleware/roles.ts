import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User.js";

export const requireRole = (...allowedRoles: (UserRole | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        message: `Forbidden. Access requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};
