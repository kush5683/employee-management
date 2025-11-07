import { Router } from "express";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeesController.js";

const router = Router();

// base path is /api/employees (mounted in server.js), so use "/"
router.get("/", listEmployees);
router.post("/", createEmployee);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router; // ✅ default export