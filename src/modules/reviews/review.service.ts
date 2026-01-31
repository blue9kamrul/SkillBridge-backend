// Get all reviews (admin: all, student: only their own)
const getAllReviews = async (userId?: string, userRole?: string) => {
  let where: any = {};
  if (userRole === "ADMIN") {
    where = {};
  } else if (userRole === "STUDENT") {
    if (!userId) return [];
    where = { studentId: userId };
  } else if (userRole === "TUTOR") {
    // Tutor sees reviews they received
    if (!userId) return [];
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });
    if (!tutorProfile) return [];
    where = { tutorId: tutorProfile.id };
  }
  return prisma.review.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, image: true } },
      tutor: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
import { prisma } from "../../lib/prisma";

interface CreateReviewInput {
  studentId: string;
  tutorId: string;
  rating: number;
  comment?: string;
}

// Create a new review
const createReview = async (data: CreateReviewInput) => {
  // Validate rating is between 1 and 5
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Check if tutor exists
  const tutorExists = await prisma.tutorProfile.findUnique({
    where: { id: data.tutorId },
  });

  if (!tutorExists) {
    throw new Error("Tutor not found");
  }

  // Check if student has a completed booking with this tutor
  const completedBooking = await prisma.booking.findFirst({
    where: {
      studentId: data.studentId,
      tutorId: data.tutorId,
      status: "completed",
    },
  });

  if (!completedBooking) {
    throw new Error(
      "You can only review tutors after completing a session with them",
    );
  }

  // Check if student has already reviewed this tutor
  const existingReview = await prisma.review.findFirst({
    where: {
      studentId: data.studentId,
      tutorId: data.tutorId,
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this tutor");
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      studentId: data.studentId,
      tutorId: data.tutorId,
      rating: data.rating,
      ...(data.comment && { comment: data.comment }),
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return review;
};

// Get all reviews for a tutor
const getReviewsByTutorId = async (tutorId: string) => {
  const reviews = await prisma.review.findMany({
    where: { tutorId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

// Delete a review
const deleteReview = async (id: string, userId: string, userRole: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // Only the student who created the review or an admin can delete it
  if (review.studentId !== userId && userRole !== "ADMIN") {
    throw new Error("You can only delete your own reviews");
  }

  const tutorId = review.tutorId;

  await prisma.review.delete({
    where: { id },
  });

  return { message: "Review deleted successfully" };
};

export const reviewService = {
  createReview,
  getReviewsByTutorId,
  deleteReview,
  getAllReviews,
};
