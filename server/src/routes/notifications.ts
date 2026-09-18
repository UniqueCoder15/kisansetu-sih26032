import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", authenticateToken, getMyNotifications);
router.patch("/:id/read", authenticateToken, markAsRead);
router.patch("/read-all", authenticateToken, markAllAsRead);

export default router;
