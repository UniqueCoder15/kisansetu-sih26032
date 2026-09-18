import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./auth.js";
import farmerRoutes from "./farmers.js";
import centreRoutes from "./centres.js";
import queueRoutes from "./queue.js";
import adminRoutes from "./admin.js";
import procurementRoutes from "./procurement.js";
import paymentRoutes from "./payment.js";
import notificationRoutes from "./notifications.js";
import auditRoutes from "./audit.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/farmers", farmerRoutes);
router.use("/centres", centreRoutes);
router.use("/queue", queueRoutes);
router.use("/admin", adminRoutes);
router.use("/procurement", procurementRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", auditRoutes);

export default router;
