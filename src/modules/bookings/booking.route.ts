import { Router } from "express";
import { BookingController } from "./booking.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// Only students can create bookings
router.post("/", auth(UserRole.STUDENT), BookingController.createBooking);

// Admin can see all, and tutor students can see their own bookings
router.get("/", auth(), BookingController.getAllBookings);
router.get("/:id", auth(), BookingController.getBookingById);

router.patch("/:id/status", auth(), BookingController.updateBookingStatus);

// admin and student can delete bookings
router.delete(
  "/:id",
  auth(UserRole.STUDENT, UserRole.ADMIN),
  BookingController.deleteBooking,
);

export default router;
