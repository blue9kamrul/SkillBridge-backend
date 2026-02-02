import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";

export enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
        phone: string | null;
        status: string;
      };
    }
  }
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log full auth debugging info
      console.log(`[AuthMiddleware] ${req.method} ${req.path}`);
      console.log(`[AuthMiddleware] Origin:`, req.headers.origin);
      console.log(`[AuthMiddleware] Cookie header:`, req.headers.cookie);
      
      // get user session
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      console.log(`[AuthMiddleware] Session result:`, session ? `valid (user: ${session.user.id})` : 'null/invalid');

      if (!session) {
        console.log(`[AuthMiddleware] 401 - No session found`);
        return res.status(401).json({
          success: false,
          message: "You are not authorized!",
        });
      }

      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required. Please verfiy your email!",
        });
      }

      // Check if user account is active
      if (session.user.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as string,
        emailVerified: session.user.emailVerified,
        phone: session.user.phone as string | null,
        status: session.user.status as string,
      };

      if (roles.length && !roles.includes(req.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resources!",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
