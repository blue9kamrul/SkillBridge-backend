import { Router } from "express";
import { CategoryController } from "./category.controller";

const router = Router();

// Get all categories
router.get("/", CategoryController.getAllCategories);

export default router;
