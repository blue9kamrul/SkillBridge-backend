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

// Create a new category
const createCategory = async (data: { name: string; description?: string }) => {
  // Check if category already exists
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new Error("Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      ...(data.description && { description: data.description }),
    },
  });

  return category;
};

// Update a category
const updateCategory = async (
  id: string,
  data: { name?: string; description?: string },
) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Check if new name conflicts with existing category
  if (data.name) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

  return updatedCategory;
};

// Delete a category
const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      tutors: true,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Check if category has tutors
  if (category.tutors.length > 0) {
    throw new Error(
      "Cannot delete category with associated tutors. Please reassign tutors first.",
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  return { message: "Category deleted successfully" };
};

export const categoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
