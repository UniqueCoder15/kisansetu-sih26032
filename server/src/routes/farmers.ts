import { Router } from "express";
import { getMyFarmerProfile, updateMyFarmerProfile } from "../controllers/farmerController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validate, farmerProfileUpdateSchema } from "../middleware/validation.js";
import { UserRole } from "../models/User.js";

const router = Router();

router.get("/me", authenticateToken, requireRole(UserRole.FARMER, UserRole.ADMIN), getMyFarmerProfile);
router.put(
  "/me",
  authenticateToken,
  requireRole(UserRole.FARMER, UserRole.ADMIN),
  validate(farmerProfileUpdateSchema),
  updateMyFarmerProfile
);

export default router;
