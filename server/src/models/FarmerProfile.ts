import { Schema, model, Document, Types } from "mongoose";

export interface IFarmerProfile extends Document {
  userId: Types.ObjectId;
  farmerName: string;
  phone: string;
  district: string;
  village: string;
  procurementCentreId?: Types.ObjectId;
  cropType: string;
  expectedQuantity: number;
  vehicleNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const farmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    farmerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    procurementCentreId: { type: Schema.Types.ObjectId, ref: "ProcurementCentre" },
    cropType: { type: String, required: true, trim: true },
    expectedQuantity: { type: Number, required: true, min: 0 },
    vehicleNumber: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const FarmerProfile = model<IFarmerProfile>("FarmerProfile", farmerProfileSchema);
