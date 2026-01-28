import { Router } from "express";
import { TutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// Public routes
router.get("/", TutorController.getAllTutors);
router.get("/available", TutorController.getAvailableTutors);
router.get("/:id", TutorController.getTutorById);
router.get("/:id/availability", TutorController.getTutorAvailability);

// Protected routes
router.post("/become-tutor", auth(), TutorController.createTutorProfile);
router.put("/:id", auth(UserRole.TUTOR, UserRole.ADMIN), TutorController.updateTutorProfile);
router.delete("/:id", auth(UserRole.TUTOR, UserRole.ADMIN), TutorController.deleteTutorProfile);

export default router;
