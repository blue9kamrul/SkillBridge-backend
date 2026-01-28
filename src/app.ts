import express, { Application } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import errorHandler from "./middlewares/globalErrorHandler";

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

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Global error handling middleware
app.use(errorHandler);

export default app;
