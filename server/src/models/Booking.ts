import { Schema, model, Document, Types } from "mongoose";

export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
}

export interface IBooking extends Document {
  bookingReference: string;
  farmerId: Types.ObjectId;
  centreId: Types.ObjectId;
  slotId: Types.ObjectId;
  crop: string;
  estimatedQuantity: number;
  vehicleNumber: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingReference: { type: String, required: true, unique: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true, index: true },
    centreId: { type: Schema.Types.ObjectId, ref: "ProcurementCentre", required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    crop: { type: String, required: true },
    estimatedQuantity: { type: Number, required: true },
    vehicleNumber: { type: String, required: true },
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.CONFIRMED },
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", bookingSchema);
