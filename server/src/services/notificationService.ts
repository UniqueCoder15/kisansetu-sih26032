import { Notification, INotification } from "../models/Notification.js";
import { emitNotification } from "./socketService.js";
import { Types } from "mongoose";

export const createNotification = async (
  userId: string | Types.ObjectId,
  type: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<INotification> => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
    read: false,
  });

  // Emit real-time notification via Socket.IO if available
  try {
    emitNotification(userId.toString(), notification.toObject());
  } catch (err) {
    // Socket might not be active, log gracefully
    console.log(`[NotificationService] Real-time socket notification broadcast skipped.`);
  }

  return notification;
};

export const getUserNotifications = async (userId: string | Types.ObjectId): Promise<INotification[]> => {
  return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string | Types.ObjectId
): Promise<INotification | null> => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
};

export const markAllNotificationsAsRead = async (userId: string | Types.ObjectId): Promise<number> => {
  const result = await Notification.updateMany({ userId, read: false }, { read: true });
  return result.modifiedCount;
};
