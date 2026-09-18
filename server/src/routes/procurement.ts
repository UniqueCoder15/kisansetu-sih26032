import { Router } from "express";
import {
  logWeighing,
  logQualityAndCreateReceipt,
  getMyProcurements,
  getProcurementById,
} from "../controllers/procurementController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { UserRole } from "../models/User.js";

const router = Router();

router.use(authenticateToken);

router.post("/weighing", requireRole(UserRole.OPERATOR, UserRole.ADMIN), logWeighing);
router.post("/quality", requireRole(UserRole.OPERATOR, UserRole.ADMIN), logQualityAndCreateReceipt);
router.get("/my-procurements", getMyProcurements);
router.get("/:id", getProcurementById);

export default router;
