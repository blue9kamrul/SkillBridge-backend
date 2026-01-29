import { Router } from "express";
import { AdminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// All admin routes require ADMIN role
router.get(
  "/dashboard",
  auth(UserRole.ADMIN),
  AdminController.getDashboardStats,
);
router.get("/users", auth(UserRole.ADMIN), AdminController.getAllUsers);

router.patch(
  "/users/:id",
  auth(UserRole.ADMIN),
  AdminController.updateUserStatus,
);

export default router;
