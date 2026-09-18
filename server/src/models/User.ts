import { Schema, model, Document } from "mongoose";

export enum UserRole {
  FARMER = "FARMER",
  OPERATOR = "OPERATOR",
  ADMIN = "ADMIN",
}

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  district?: string;
  state?: string;
  preferredLanguage: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.FARMER,
      required: true,
    },
    district: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    preferredLanguage: { type: String, default: "hi", trim: true },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Method to return safe JSON user representation without sensitive data
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User = model<IUser>("User", userSchema);
