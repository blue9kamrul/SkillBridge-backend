import { prisma } from "../../lib/prisma";

// Get all categories
const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      tutors: {
        select: {
          id: true,
          bio: true,
          subjects: true,
          hourlyRate: true,
          experience: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

export const categoryService = {
  getAllCategories,
};
