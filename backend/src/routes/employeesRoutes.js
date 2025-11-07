import { Router } from "express";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeesController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireManager } from "../middleware/permissions.js";

const router = Router();

router.use(requireAuth, requireManager);

router.get("/", listEmployees);
router.post("/", createEmployee);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router; // ✅ default export
