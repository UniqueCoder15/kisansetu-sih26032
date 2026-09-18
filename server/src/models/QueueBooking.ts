import { Schema, model, Document, Types } from "mongoose";

export enum BookingQueueStatus {
  WAITING = "WAITING",
  CALLED = "CALLED",
  ARRIVED = "ARRIVED",
  WEIGHING = "WEIGHING",
  QUALITY_CHECK = "QUALITY_CHECK",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export interface IQueueBooking extends Document {
  tokenNumber: string;
  farmerId: Types.ObjectId;
  procurementCentreId: Types.ObjectId;
  cropType: string;
  quantityQuintals: number;
  vehicleNumber: string;
  bookingDate: Date;
  scheduledSlot: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  status: BookingQueueStatus;
  createdAt: Date;
  updatedAt: Date;
}

const queueBookingSchema = new Schema<IQueueBooking>(
  {
    tokenNumber: { type: String, required: true, unique: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    procurementCentreId: {
      type: Schema.Types.ObjectId,
      ref: "ProcurementCentre",
      required: true,
      index: true,
    },
    cropType: { type: String, required: true, trim: true },
    quantityQuintals: { type: Number, required: true, min: 0.1 },
    vehicleNumber: { type: String, required: true, trim: true },
    bookingDate: { type: Date, required: true, index: true },
    scheduledSlot: { type: String, required: true, trim: true },
    queuePosition: { type: Number, required: true, default: 1 },
    estimatedWaitMinutes: { type: Number, required: true, default: 30 },
    status: {
      type: String,
      enum: Object.values(BookingQueueStatus),
      default: BookingQueueStatus.WAITING,
      index: true,
    },
  },
  { timestamps: true }
);

queueBookingSchema.index({ procurementCentreId: 1, bookingDate: 1, status: 1 });

export const QueueBooking = model<IQueueBooking>("QueueBooking", queueBookingSchema);
