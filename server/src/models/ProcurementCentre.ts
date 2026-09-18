import { Schema, model, Document } from "mongoose";

export enum CentreStatus {
  NORMAL = "NORMAL",
  BUSY = "BUSY",
  HEAVY_CONGESTION = "HEAVY_CONGESTION",
  CLOSED = "CLOSED",
}

export interface IProcurementCentre extends Document {
  name: string;
  centreCode: string;
  district: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  dailyCapacityQuintals: number;
  currentLoadQuintals: number;
  activeFarmers: number;
  status: CentreStatus;
  operatingStartTime: string;
  operatingEndTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const procurementCentreSchema = new Schema<IProcurementCentre>(
  {
    name: { type: String, required: true, trim: true },
    centreCode: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    district: { type: String, required: true, index: true, trim: true },
    state: { type: String, required: true, index: true, trim: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    dailyCapacityQuintals: { type: Number, required: true, default: 1000 },
    currentLoadQuintals: { type: Number, required: true, default: 0 },
    activeFarmers: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: Object.values(CentreStatus),
      default: CentreStatus.NORMAL,
    },
    operatingStartTime: { type: String, default: "08:00 AM" },
    operatingEndTime: { type: String, default: "06:00 PM" },
  },
  { timestamps: true }
);

export const ProcurementCentre = model<IProcurementCentre>(
  "ProcurementCentre",
  procurementCentreSchema
);
