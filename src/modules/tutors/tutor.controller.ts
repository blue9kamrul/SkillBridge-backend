// Get authenticated tutor's own profile
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
    const tutor = await tutorService.getTutorByUserId(userId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "No tutor profile found.",
      });
    }
    res.status(200).json({
      success: true,
      data: tutor,
    });
  } catch (error) {
    next(error);
  }
};
import { Request, Response, NextFunction } from "express";
import { tutorService } from "./tutor.service";

// Get all tutors
const getAllTutors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get from query parameters
    const { subjects, minRate, maxRate, minExperience, categoryId } = req.query;

    // filter parameters
    const filters: {
      subjects?: string[];
      minRate?: number;
      maxRate?: number;
      minExperience?: number;
      categoryId?: string;
    } = {};

    if (subjects) {
      filters.subjects = (subjects as string).split(",");
      // db needs an array of strings
    }
    if (minRate) {
      filters.minRate = parseFloat(minRate as string);
      // db needs a number
    }
    if (maxRate) {
      filters.maxRate = parseFloat(maxRate as string);
      // db needs a number
    }
    if (minExperience) {
      filters.minExperience = parseInt(minExperience as string);
    }
    if (categoryId) {
      filters.categoryId = categoryId as string;
    }

    const tutors = await tutorService.getAllTutors(filters);

    res.status(200).json({
      success: true,
      count: tutors.length,
      data: tutors,
    });
  } catch (error) {
    next(error);
  }
};

// Get featured tutors
const getFeaturedTutors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { limit } = req.query;
    const tutors = await tutorService.getFeaturedTutors(
      limit ? parseInt(limit as string) : 6,
    );

    res.status(200).json({
      success: true,
      count: tutors.length,
      data: tutors,
    });
  } catch (error) {
    next(error);
  }
};

// Get all tutors who are available (have availability set)
const getAvailableTutors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tutors = await tutorService.getAvailableTutors();

    res.status(200).json({
      success: true,
      count: tutors.length,
      data: tutors,
    });
  } catch (error) {
    next(error);
  }
};

// Get tutor profile through id
const getTutorById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // get this from headers
    const { id } = req.params;

    const tutor = await tutorService.getTutorById(id as string);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tutor,
    });
  } catch (error) {
    next(error);
  }
};

// Get tutor availability
const getTutorAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const availability = await tutorService.getTutorAvailability(id as string);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found or no availability set",
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

// Create tutor profile (authenticated users only)
const createTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { bio, subjects, hourlyRate, experience, availability } = req.body;

    // Validation
    if (!bio || !subjects || !hourlyRate || experience === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: bio, subjects, hourlyRate, experience",
      });
    }

    const tutorProfile = await tutorService.createTutorProfile(userId, {
      bio,
      subjects,
      hourlyRate,
      experience,
      availability,
    });

    res.status(201).json({
      success: true,
      message: "Tutor profile created successfully",
      data: tutorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Update authenticated tutor's own profile
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

    const { bio, subjects, hourlyRate, experience, availability } = req.body;

    const updatedProfile = await tutorService.updateTutorProfile(userId, {
      bio,
      subjects,
      hourlyRate,
      experience,
      availability,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Delete tutor profile (admin only)
const deleteTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await tutorService.deleteTutorProfile(
      id as string,
      userId,
      userRole as string,
    );

    res.status(200).json({
      success: true,
      message: "Tutor profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update tutor's own profile
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

    const { bio, subjects, hourlyRate, experience, availability } = req.body;

    const updatedProfile = await tutorService.updateMyProfileByUserId(userId, {
      bio,
      subjects,
      hourlyRate,
      experience,
      availability,
    });

    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Update tutor's availability only
const updateMyAvailability = async (
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

    const { availability } = req.body;

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "Please provide availability",
      });
    }

    const updatedProfile = await tutorService.updateMyAvailability(
      userId,
      availability,
    );

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const TutorController = {
  getAllTutors,
  getFeaturedTutors,
  getAvailableTutors,
  getTutorById,
  getTutorAvailability,
  createTutorProfile,
  updateMyProfile,
  updateMyAvailability,
  deleteTutorProfile,
  getMyProfile,
};
