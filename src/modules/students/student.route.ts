import { Router } from "express";
import { StudentController } from "./student.controller";
import auth from "../../middlewares/auth";

const router = Router();

// Student profile routes (authenticated users)
router.get("/profile", auth(), StudentController.getMyProfile);
router.patch("/profile", auth(), StudentController.updateMyProfile);

export default router;
