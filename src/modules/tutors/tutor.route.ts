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

// Tutor's own profile management
router.put("/profile", auth(UserRole.TUTOR), TutorController.updateMyProfile);
router.put(
  "/availability",
  auth(UserRole.TUTOR),
  TutorController.updateMyAvailability,
);

// Admin can delete specific tutor profiles
router.delete("/:id", auth(UserRole.ADMIN), TutorController.deleteTutorProfile);

export default router;
