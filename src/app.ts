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

// Configure CORS to only allow trusted origins (from env TRUSTED_ORIGINS or APP_URL)
const trustedOrigins = (() => {
  if (process.env.TRUSTED_ORIGINS)
    return process.env.TRUSTED_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  if (process.env.APP_URL) return [process.env.APP_URL];
  return [];
})();

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser requests with no origin
      if (!origin) return cb(null, true);
      if (trustedOrigins.length === 0) return cb(null, true);
      if (trustedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Log auth-related requests for debugging origin/cookie issues
app.use((req, res, next) => {
  if (req.path.startsWith("/api/auth") || req.path === "/api/user/me") {
    console.log(
      `[AuthDebug] ${req.method} ${req.path} origin=${req.headers.origin} cookie=${req.headers.cookie}`,
    );
    
    // Handle duplicate session tokens by keeping only the last one
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').map(c => c.trim());
      const sessionCookies = cookies.filter(c => c.startsWith('__Secure-better-auth.session_token='));
      
      if (sessionCookies.length > 1) {
        console.log(`[AuthDebug] Found ${sessionCookies.length} session tokens, using the last one`);
        // Remove duplicate session tokens, keep only the last one
        const otherCookies = cookies.filter(c => !c.startsWith('__Secure-better-auth.session_token='));
        req.headers.cookie = [...otherCookies, sessionCookies[sessionCookies.length - 1]].join('; ');
        console.log(`[AuthDebug] Cleaned cookie header: ${req.headers.cookie}`);
      }
    }
  }
  next();
});

app.use(express.json());

// Mount custom auth routes at /api/user for /api/user/me
app.use("/api/user", authRoutes);

// better-auth routes - use middleware instead of route
app.use("/api/auth", (req, res, next) => {
  // Intercept res.setHeader to force SameSite=None; Secure on all Set-Cookie headers
  const origSetHeader = res.setHeader.bind(res);
  res.setHeader = function (name: string, value: any) {
    if (String(name).toLowerCase() === "set-cookie") {
      const cookies = Array.isArray(value) ? value : [String(value)];
      const rewritten = cookies.map((c: string) => {
        let cookie = String(c);
        // Remove any existing SameSite directive
        cookie = cookie.replace(/;\s*SameSite=[^;]*/gi, "");
        // Ensure Secure is present
        if (!/;\s*Secure/i.test(cookie)) cookie += "; Secure";
        // Add SameSite=None
        cookie += "; SameSite=None";
        return cookie;
      });
      console.log(
        `[AuthDebug] Set-Cookie rewritten to: ${JSON.stringify(rewritten)}`,
      );
      return origSetHeader.call(this, name, rewritten);
    }
    return origSetHeader.call(this, name, value);
  };

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
