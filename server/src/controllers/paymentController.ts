import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/paymentService.js";

export const getMyPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const payments = await PaymentService.getFarmerPayments(req.user.userId);
    res.status(200).json({
      status: "success",
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
};

export const disbursePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const payment = await PaymentService.disbursePayment(id);
    res.status(200).json({
      status: "success",
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};
