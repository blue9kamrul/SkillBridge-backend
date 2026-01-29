import { Request, Response, NextFunction } from "express";
import { studentService } from "./student.service";

// Get my profile
const getMyProfile = async (
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

    const profile = await studentService.getMyProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// Update my profile
const updateMyProfile = async (
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

    const { name, phone, image } = req.body;

    if (!name && phone === undefined && image === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name, phone, or image) is required",
      });
    }

    const profile = await studentService.updateMyProfile(userId, {
      name,
      phone,
      image,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const StudentController = {
  getMyProfile,
  updateMyProfile,
};
