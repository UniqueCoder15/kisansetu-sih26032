import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, registerSchema, loginSchema } from "../middleware/validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticateToken, getMe);

export default router;
