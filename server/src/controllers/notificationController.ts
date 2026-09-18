import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notificationService.js";

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const notifications = await notificationService.getUserNotifications(userId);
    res.status(200).json({
      status: "success",
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const notification = await notificationService.markNotificationAsRead(id, userId);
    if (!notification) {
      res.status(404).json({ status: "error", message: "Notification not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const count = await notificationService.markAllNotificationsAsRead(userId);
    res.status(200).json({
      status: "success",
      message: `Marked ${count} notifications as read`,
      data: { updatedCount: count },
    });
  } catch (error) {
    next(error);
  }
};
