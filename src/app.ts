import express, { Application } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";

import tutorRoutes from "./modules/tutors/tutor.route";
import bookingRoutes from "./modules/bookings/booking.route";
import authRoutes from "./modules/auth/auth.route";

import categoryRoutes from "./modules/categories/category.route";
import reviewRoutes from "./modules/reviews/review.route";
import adminRoutes from "./modules/admin/admin.route";
import studentRoutes from "./modules/students/student.route";

const app: Application = express();

app.use(
  cors({
    origin: true, // Allow all origins for testing (change back later)
    credentials: true,
  }),
);

app.use(express.json());

// Mount custom auth routes at /api/user for /api/user/me
app.use("/api/user", authRoutes);

// better-auth routes - use middleware instead of route
app.use("/api/auth", (req, res, next) => {
  return toNodeHandler(auth)(req, res).catch((err) => {
    next(err);
  });
});

app.use("/api/tutors", tutorRoutes); // Public & Student routes
app.use("/api/bookings", bookingRoutes); // Student routes
app.use("/api/categories", categoryRoutes); // Public routes
app.use("/api/reviews", reviewRoutes); // Public & Student routes
app.use("/api/admin", adminRoutes); // Admin routes
app.use("/api/students", studentRoutes); // Student profile routes

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillBridge API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/*",
      tutors: "/api/tutors",
      bookings: "/api/bookings",
      categories: "/api/categories",
      admin: "/api/admin",
      reviews: "/api/reviews",
      students: "/api/students",
    },
  });
});

// 404 handler
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

export default app;
