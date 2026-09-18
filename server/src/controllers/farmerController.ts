import { Request, Response, NextFunction } from "express";
import { FarmerService } from "../services/farmerService.js";

export const getMyFarmerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const profile = await FarmerService.getFarmerProfile(req.user.userId);
    res.status(200).json({
      status: "success",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyFarmerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const profile = await FarmerService.updateFarmerProfile(req.user.userId, req.body);
    res.status(200).json({
      status: "success",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};
