import { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service";

// Get dashboard statistics
const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const { role, emailVerified } = req.body;

    if (!role && emailVerified === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (role or emailVerified) is required",
      });
    }

    const user = await adminService.updateUserStatus(id, {
      role,
      emailVerified,
    });

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
};
