import express, { Application } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";

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
  console.log("Auth request:", req.method, req.url);
  console.log("Body:", req.body);
  return toNodeHandler(auth)(req, res).catch((err) => {
    console.error("Auth error:", err);
    next(err);
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export default app;
