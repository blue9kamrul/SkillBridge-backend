import { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service";

// Get all categories
const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const CategoryController = {
  getAllCategories,
};
