import { Request, Response, NextFunction } from "express";
import { CentreService } from "../services/centreService.js";

export const getCentres = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const district = req.query.district as string | undefined;
    const centres = await CentreService.getAllCentres(district);
    res.status(200).json({
      status: "success",
      data: { centres },
    });
  } catch (error) {
    next(error);
  }
};

export const getCentreById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const centre = await CentreService.getCentreById(id);
    res.status(200).json({
      status: "success",
      data: { centre },
    });
  } catch (error) {
    next(error);
  }
};
