import { Request, Response, NextFunction } from "express";
import * as auditService from "../services/auditService.js";

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { actorRole, action, entityType, limit } = req.query;

    const logs = await auditService.getAuditLogs({
      actorRole: actorRole as string,
      action: action as string,
      entityType: entityType as string,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });

    res.status(200).json({
      status: "success",
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};
