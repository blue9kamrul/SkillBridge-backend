import { prisma } from "../../lib/prisma";

// Get all tutors with optional filters
const getAllTutors = async (filters: {
  subjects?: string[];
  minRate?: number;
  maxRate?: number;
  minExperience?: number;
}) => {
  const tutors = await prisma.tutorProfile.findMany({
    where: {
      ...(filters.subjects?.length && {
        subjects: { hasSome: filters.subjects },
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      categories: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      user: {
        createdAt: "desc",
      },
    },
  });

  // Filter by rate and experience
  const filteredTutors = tutors.filter((tutor) => {
    if (filters.minRate && Number(tutor.hourlyRate) < filters.minRate)
      return false;
    if (filters.maxRate && Number(tutor.hourlyRate) > filters.maxRate)
      return false;
    if (filters.minExperience && tutor.experience < filters.minExperience)
      return false;
    return true;
  });

  return filteredTutors;
};

// Get all tutors who have availability
const getAvailableTutors = async () => {
  const allTutors = await prisma.tutorProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      categories: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      user: {
        createdAt: "desc",
      },
    },
  });

  // Filter tutors who have availability set
  return allTutors.filter((tutor) => tutor.availability !== null);
};

// Get single tutor by ID
const getTutorById = async (tutorId: string) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
      categories: true,
      reviews: {
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
      },
    },
  });

  if (!tutor) {
    return null;
  }

  return tutor;
};

// Get tutor's availability
const getTutorAvailability = async (tutorId: string) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    select: {
      availability: true,
    },
  });

  return tutor?.availability || null;
};

// Create tutor profile for a user
const createTutorProfile = async (
  userId: string,
  data: {
    bio: string;
    subjects: string[];
    hourlyRate: number;
    experience: number;
    availability?: any;
  },
) => {
  // Check if user already has a tutor profile
  const existingProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw new Error("User already has a tutor profile");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Create tutor profile and update user role in a transaction, so that if middle of the process aborts whole process rolls back
  return await prisma.$transaction(async (tx) => {
    const profile = await tx.tutorProfile.create({
      data: {
        userId,
        bio: data.bio,
        subjects: data.subjects,
        hourlyRate: data.hourlyRate,
        experience: data.experience,
        availability: data.availability || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update user role to TUTOR
    await tx.user.update({
      where: { id: userId },
      data: { role: "TUTOR" },
    });

    return profile;
  });
};

// Update tutor profile
const updateTutorProfile = async (
  tutorId: string,
  userId: string,
  userRole: string,
  data: {
    bio?: string;
    subjects?: string[];
    hourlyRate?: number;
    experience?: number;
    availability?: any;
  },
) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found");
  }

  // only tutor himself and admin can update the profile
  if (userRole !== "ADMIN" && tutor.userId !== userId) {
    throw new Error("You don't have permission to update this tutor profile");
  }

  const updateData: any = {};

  if (data.bio) updateData.bio = data.bio;
  if (data.subjects) updateData.subjects = data.subjects;
  if (data.hourlyRate) updateData.hourlyRate = data.hourlyRate;
  if (data.experience !== undefined) updateData.experience = data.experience;
  if (data.availability !== undefined)
    updateData.availability = data.availability;

  return await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
};

// Delete tutor profile
const deleteTutorProfile = async (
  tutorId: string,
  userId: string,
  userRole: string,
) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found");
  }

  if (userRole !== "ADMIN" && tutor.userId !== userId) {
    throw new Error("You don't have permission to delete this tutor profile");
  }

  // Delete profile
  return await prisma.$transaction(async (tx) => {
    await tx.tutorProfile.delete({
      where: { id: tutorId },
    });
  });
};

export const tutorService = {
  getAllTutors,
  getAvailableTutors,
  getTutorById,
  getTutorAvailability,
  createTutorProfile,
  updateTutorProfile,
  deleteTutorProfile,
};
