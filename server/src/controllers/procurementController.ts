import { Request, Response, NextFunction } from "express";
import { ProcurementService } from "../services/procurementService.js";
import { QualityGrade } from "../models/QualityCheck.js";

export const logWeighing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, grossWeightKg, tareWeightKg } = req.body;
    const result = await ProcurementService.logWeighing({
      bookingId,
      grossWeightKg: Number(grossWeightKg),
      tareWeightKg: Number(tareWeightKg),
    });
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logQualityAndCreateReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const { bookingId, moisturePercentage, grade, remarks } = req.body;
    const result = await ProcurementService.logQualityAndCreateReceipt({
      bookingId,
      moisturePercentage: Number(moisturePercentage || 12.5),
      grade: (grade as QualityGrade) || QualityGrade.GRADE_A,
      remarks,
      inspectorId: req.user.userId,
    });
    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProcurements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const procurements = await ProcurementService.getFarmerProcurements(req.user.userId);
    res.status(200).json({
      status: "success",
      data: { procurements },
    });
  } catch (error) {
    next(error);
  }
};

export const getProcurementById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const details = await ProcurementService.getProcurementById(id);
    res.status(200).json({
      status: "success",
      data: details,
    });
  } catch (error) {
    next(error);
  }
};
