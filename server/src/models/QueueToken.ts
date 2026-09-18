import { Schema, model, Document, Types } from "mongoose";

export enum QueueStatus {
  WAITING = "WAITING",
  CALLED = "CALLED",
  ARRIVED = "ARRIVED",
  WEIGHING = "WEIGHING",
  QUALITY_CHECK = "QUALITY_CHECK",
  PROCUREMENT_COMPLETED = "PROCUREMENT_COMPLETED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface IQueueToken extends Document {
  tokenNumber: string;
  bookingId: Types.ObjectId;
  centreId: Types.ObjectId;
  queueDate: Date;
  position: number;
  status: QueueStatus;
  calledAt?: Date;
  arrivedAt?: Date;
  completedAt?: Date;
  estimatedWaitMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const queueTokenSchema = new Schema<IQueueToken>(
  {
    tokenNumber: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    centreId: { type: Schema.Types.ObjectId, ref: "ProcurementCentre", required: true },
    queueDate: { type: Date, required: true },
    position: { type: Number, required: true },
    status: { type: String, enum: Object.values(QueueStatus), default: QueueStatus.WAITING },
    calledAt: { type: Date },
    arrivedAt: { type: Date },
    completedAt: { type: Date },
    estimatedWaitMinutes: { type: Number, default: 30 },
  },
  { timestamps: true }
);

// Compound indexes for fast queue lookups
queueTokenSchema.index({ centreId: 1, queueDate: 1 });
queueTokenSchema.index({ centreId: 1, status: 1 });

export const QueueToken = model<IQueueToken>("QueueToken", queueTokenSchema);
