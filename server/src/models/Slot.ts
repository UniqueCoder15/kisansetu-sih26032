import { Schema, model, Document, Types } from "mongoose";

export enum SlotStatus {
  AVAILABLE = "AVAILABLE",
  LIMITED = "LIMITED",
  FULL = "FULL",
  CLOSED = "CLOSED",
}

export interface ISlot extends Document {
  centreId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: SlotStatus;
  createdAt: Date;
  updatedAt: Date;
}

const slotSchema = new Schema<ISlot>(
  {
    centreId: { type: Schema.Types.ObjectId, ref: "ProcurementCentre", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, default: 25 },
    bookedCount: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(SlotStatus), default: SlotStatus.AVAILABLE },
  },
  { timestamps: true }
);

// Compound index to quickly find slots for a centre on a given date
slotSchema.index({ centreId: 1, date: 1 });

export const Slot = model<ISlot>("Slot", slotSchema);
