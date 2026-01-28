import express, { Application } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";

import tutorRoutes from "./modules/tutors/tutor.route";
import bookingRoutes from "./modules/bookings/booking.route";

const app: Application = express();

app.use(
  cors({
    origin: true, // Allow all origins for testing (change back later)
    credentials: true,
  }),
);

app.use(express.json());

// better-auth routes - use middleware instead of route
app.use("/api/auth", (req, res, next) => {
  return toNodeHandler(auth)(req, res).catch((err) => {
    next(err);
  });
});

app.use("/api/tutors", tutorRoutes); // Public & Student routes
app.use("/api/bookings", bookingRoutes); // Student routes

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillBridge API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/*",
      tutors: "/api/tutors",
      bookings: "/api/bookings",
    },
  });
});

// 404 handler
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

export default app;
