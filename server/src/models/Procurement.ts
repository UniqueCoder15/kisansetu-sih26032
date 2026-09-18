import { Schema, model, Document, Types } from "mongoose";

export interface IProcurement extends Document {
  bookingId: Types.ObjectId;
  farmerId: Types.ObjectId;
  centreId: Types.ObjectId;
  crop: string;
  quantity: number;
  ratePerQuintal: number;
  totalAmount: number;
  procurementDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const procurementSchema = new Schema<IProcurement>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true, index: true },
    centreId: { type: Schema.Types.ObjectId, ref: "ProcurementCentre", required: true, index: true },
    crop: { type: String, required: true },
    quantity: { type: Number, required: true }, // Net quantity in quintals
    ratePerQuintal: { type: Number, required: true }, // Government MSP rate
    totalAmount: { type: Number, required: true },
    procurementDate: { type: Date, default: Date.now },
    status: { type: String, default: "COMPLETED" },
  },
  { timestamps: true }
);

export const Procurement = model<IProcurement>("Procurement", procurementSchema);
