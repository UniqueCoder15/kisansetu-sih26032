import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  actorId?: Types.ObjectId;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for auditing logs chronologically
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
