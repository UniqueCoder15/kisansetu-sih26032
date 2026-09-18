import { Schema, model, Document, Types } from "mongoose";

export enum QualityGrade {
  GRADE_A = "GRADE_A",
  GRADE_B = "GRADE_B",
  REJECTED = "REJECTED",
}

export interface IQualityCheck extends Document {
  procurementId: Types.ObjectId;
  grade: QualityGrade;
  moisturePercentage: number;
  qualityStatus: string;
  remarks?: string;
  checkedBy: Types.ObjectId;
  checkedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const qualityCheckSchema = new Schema<IQualityCheck>(
  {
    procurementId: { type: Schema.Types.ObjectId, ref: "Procurement", required: true, index: true },
    grade: { type: String, enum: Object.values(QualityGrade), default: QualityGrade.GRADE_A },
    moisturePercentage: { type: Number, required: true },
    qualityStatus: { type: String, default: "PASSED" },
    remarks: { type: String },
    checkedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const QualityCheck = model<IQualityCheck>("QualityCheck", qualityCheckSchema);
