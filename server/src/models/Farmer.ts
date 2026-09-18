import { Schema, model, Document, Types } from "mongoose";

export interface IFarmer extends Document {
  userId: Types.ObjectId;
  farmerId: string;
  village: string;
  district: string;
  state: string;
  preferredLanguage: "en" | "hi";
  createdAt: Date;
  updatedAt: Date;
}

const farmerSchema = new Schema<IFarmer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farmerId: { type: String, required: true, unique: true, index: true },
    village: { type: String, required: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true },
    preferredLanguage: { type: String, enum: ["en", "hi"], default: "en" },
  },
  { timestamps: true }
);

export const Farmer = model<IFarmer>("Farmer", farmerSchema);
