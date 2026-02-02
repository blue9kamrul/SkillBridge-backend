import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";

// Get current user
const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await authService.getCurrentUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Handle banned user error specifically
    if (error instanceof Error && error.message.includes("banned")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const updatePhone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const user = await authService.updatePhone(userId, phone);

    res.status(200).json({
      success: true,
      data: user,
      message: "Phone number updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const AuthController = {
  getCurrentUser,
  updatePhone,
};
