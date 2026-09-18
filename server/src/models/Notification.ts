import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for fast retrieval of unread notifications for a user
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
