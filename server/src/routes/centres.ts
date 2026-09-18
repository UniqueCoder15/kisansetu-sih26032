import { Router } from "express";
import { getCentres, getCentreById } from "../controllers/centreController.js";

const router = Router();

router.get("/", getCentres);
router.get("/:id", getCentreById);

export default router;
