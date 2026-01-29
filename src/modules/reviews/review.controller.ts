import { Request, Response, NextFunction } from "express";
import { reviewService } from "./review.service";

// Create review
const createReview = async (
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

    const { tutorId, rating, comment } = req.body;

    if (!tutorId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID and rating are required",
      });
    }

    const review = await reviewService.createReview({
      studentId: userId,
      tutorId,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews by tutor ID
const getReviewsByTutorId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId || typeof tutorId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
    }

    const reviews = await reviewService.getReviewsByTutorId(tutorId);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Delete review
const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await reviewService.deleteReview(
      id,
      userId,
      userRole as string,
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const ReviewController = {
  createReview,
  getReviewsByTutorId,
  deleteReview,
};
