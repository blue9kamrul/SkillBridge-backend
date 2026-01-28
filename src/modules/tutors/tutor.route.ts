import { Router } from "express";
import { TutorController } from "./tutor.controller";
import auth from "../../middlewares/auth";

const router = Router();

// Public routes
router.get("/", TutorController.getAllTutors);
router.get("/available", TutorController.getAvailableTutors);
router.get("/:id", TutorController.getTutorById);
router.get("/:id/availability", TutorController.getTutorAvailability);

// Protected route - only authenticated user can become a tutor
router.post("/become-tutor", auth(), TutorController.createTutorProfile);

export default router;
