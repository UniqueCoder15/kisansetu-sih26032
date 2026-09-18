import { Router } from "express";
import { getAdminCentres, getAdminQueue, updateTokenStatus, getAdminMetrics } from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validate, queueStatusUpdateSchema } from "../middleware/validation.js";
import { UserRole } from "../models/User.js";

const router = Router();

router.use(authenticateToken);
router.use(requireRole(UserRole.OPERATOR, UserRole.ADMIN));

router.get("/centres", getAdminCentres);
router.get("/queue", getAdminQueue);
router.patch("/queue/:id/status", validate(queueStatusUpdateSchema), updateTokenStatus);
router.get("/metrics", getAdminMetrics);

export default router;
