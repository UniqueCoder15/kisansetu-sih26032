import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { getAuditLogs } from "../controllers/auditController.js";
import { UserRole } from "../models/User.js";

const router = Router();

router.get(
  "/audit-logs",
  authenticateToken,
  requireRole(UserRole.ADMIN, UserRole.OPERATOR),
  getAuditLogs
);

export default router;
