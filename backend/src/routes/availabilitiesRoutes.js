import { Router } from "express";
import {
  listByEmployee,
  upsertOne,
  deleteOne,
} from "../controllers/availabilitiesController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

// GET /availabilities?employeeId=...
router.get("/", listByEmployee);

// POST /availabilities  (upsert one day)
router.post("/", upsertOne);

// DELETE /availabilities/one  (body: { employeeId, dayOfWeek })
router.delete("/one", deleteOne);

export default router;
