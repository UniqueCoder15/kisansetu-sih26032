import { Schema, model, Document, Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export interface IPayment extends Document {
  procurementId: Types.ObjectId;
  farmerId: Types.ObjectId;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionReference?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    procurementId: { type: Schema.Types.ObjectId, ref: "Procurement", required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, default: "DBT_AADHAAR" },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING, index: true },
    transactionReference: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
