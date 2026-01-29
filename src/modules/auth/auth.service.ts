import { prisma } from "../../lib/prisma";

// Get current user with their profile information
const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      tutorProfile: {
        select: {
          id: true,
          bio: true,
          subjects: true,
          hourlyRate: true,
          experience: true,
          availability: true,
        },
      },
    },
  });

  return user;
};

export const authService = {
  getCurrentUser,
};
