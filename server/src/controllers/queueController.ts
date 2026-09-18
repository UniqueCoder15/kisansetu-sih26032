import { Request, Response, NextFunction } from "express";
import { QueueService } from "../services/queueService.js";

export const bookQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const booking = await QueueService.bookQueueToken({
      ...req.body,
      farmerId: req.user.userId,
    });
    res.status(201).json({
      status: "success",
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const bookings = await QueueService.getFarmerBookings(req.user.userId);
    res.status(200).json({
      status: "success",
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await QueueService.getBookingById(id);
    res.status(200).json({
      status: "success",
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const booking = await QueueService.cancelBooking(id, req.user.userId, req.user.role);
    res.status(200).json({
      status: "success",
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};
