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
};
