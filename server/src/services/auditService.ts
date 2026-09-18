import { AuditLog, IAuditLog } from "../models/AuditLog.js";
import { Types } from "mongoose";

export const logAuditAction = async (
  actorId: string | Types.ObjectId | undefined,
  actorRole: string,
  action: string,
  entityType: string,
  entityId?: string | Types.ObjectId,
  metadata?: Record<string, any>
): Promise<IAuditLog> => {
  return await AuditLog.create({
    actorId: actorId ? new Types.ObjectId(actorId) : undefined,
    actorRole,
    action,
    entityType,
    entityId: entityId ? new Types.ObjectId(entityId) : undefined,
    metadata,
  });
};

export const getAuditLogs = async (filters: {
  actorRole?: string;
  action?: string;
  entityType?: string;
  limit?: number;
}): Promise<IAuditLog[]> => {
  const query: any = {};
  if (filters.actorRole) query.actorRole = filters.actorRole;
  if (filters.action) query.action = filters.action;
  if (filters.entityType) query.entityType = filters.entityType;

  const limit = filters.limit || 100;

  return await AuditLog.find(query)
    .populate("actorId", "name phone email role")
    .sort({ createdAt: -1 })
    .limit(limit);
};
