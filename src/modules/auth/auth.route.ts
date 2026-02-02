import { Router } from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";

const router = Router();

// Protected route - Get current user
router.get("/me", auth(), AuthController.getCurrentUser);

// Protected route - Update phone
router.patch("/update-phone", auth(), AuthController.updatePhone);

export default router;
