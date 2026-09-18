import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const user = await AuthService.getMe(req.user.userId);
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
