import { Router } from "express";
import { bookQueue, getMyBookings, getBookingById, cancelBooking } from "../controllers/queueController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, queueBookingSchema } from "../middleware/validation.js";

const router = Router();

router.use(authenticateToken);

router.post("/book", validate(queueBookingSchema), bookQueue);
router.get("/my-bookings", getMyBookings);
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);

export default router;
