import { Router } from "express";
import { ReviewController } from "./review.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// Only students can create reviews
router.post("/", auth(UserRole.STUDENT), ReviewController.createReview);

// Get reviews by tutor ID (public)
router.get("/tutor/:tutorId", ReviewController.getReviewsByTutorId);

// Delete review (student or admin)
router.delete(
  "/:id",
  auth(UserRole.STUDENT, UserRole.ADMIN),
  ReviewController.deleteReview,
);

export default router;
