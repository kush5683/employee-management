import { Router } from "express";
import {
  listByEmployee,
  upsertOne,
  deleteOne,
} from "../controllers/availabilitiesController.js";

const router = Router();

// GET /availabilities?employeeId=...
router.get("/", listByEmployee);

// POST /availabilities  (upsert one day)
router.post("/", upsertOne);

// DELETE /availabilities/one  (body: { employeeId, dayOfWeek })
router.delete("/one", deleteOne);

export default router;