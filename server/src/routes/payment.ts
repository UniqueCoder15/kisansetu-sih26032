import { Router } from "express";
import { getMyPayments, disbursePayment } from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { UserRole } from "../models/User.js";

const router = Router();

router.use(authenticateToken);

router.get("/me", getMyPayments);
router.post("/:id/disburse", requireRole(UserRole.OPERATOR, UserRole.ADMIN), disbursePayment);

export default router;
