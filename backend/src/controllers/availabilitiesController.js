// backend/src/controllers/availabilitiesController.js
import { getDb } from "../db/mongo.js";
import { canAccessEmployee, getAccessibleEmployeeIds, isManager } from "../utils/accessControl.js";

const col = () => getDb().collection("availabilities");

// GET /availabilities?employeeId=...
export async function listByEmployee(req, res, next) {
  try {
    // Employees can only ever see their own record while managers may pass a query string.
    const accessibleIds = getAccessibleEmployeeIds(req.user);
    let targetEmployeeId = req.query.employeeId;

    if (!isManager(req.user)) {
      targetEmployeeId = req.user?.sub;
    }

    if (!targetEmployeeId) {
      return res.status(400).json({ message: "employeeId required" });
    }

    if (!accessibleIds.includes(targetEmployeeId)) {
      return res.status(403).json({ message: "You do not have access to that employee." });
    }

    const docs = await col().find({ employeeId: targetEmployeeId }).sort({ dayOfWeek: 1 }).toArray();
    res.json({ data: docs });
  } catch (err) { next(err); }
}

// POST /availabilities
// If start/end are blank → delete that day (idempotent)
export async function upsertOne(req, res, next) {
  try {
    if (!isManager(req.user)) {
      return res.status(403).json({ message: "Only managers may edit availability." });
    }

    // We intentionally require the manager to pick the employee being updated.
    const { employeeId, dayOfWeek, startTime, endTime } = req.body || {};
    if (!employeeId || dayOfWeek == null) {
      return res.status(400).json({ message: "employeeId and dayOfWeek required" });
    }

    if (!canAccessEmployee(req.user, employeeId)) {
      return res.status(403).json({ message: "You do not have access to that employee." });
    }

    const filter = { employeeId, dayOfWeek: Number(dayOfWeek) };

    // Blank means "clear this day"
    if (!startTime || !endTime) {
      await col().deleteOne(filter);          // no error if nothing existed
      return res.status(204).end();           // success, nothing to return
    }

    const update = {
      $set: {
        employeeId,
        dayOfWeek: Number(dayOfWeek),
        startTime,   // e.g. "09:00"
        endTime,     // e.g. "17:00"
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    };

    const result = await col().findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: "after",
    });

    res
      .status(result.lastErrorObject?.upserted ? 201 : 200)
      .json({ data: result.value });
  } catch (err) {
    if (err?.code === 11000) {
      err.message = "Availability for that day already exists.";
      err.status = 409;
    }
    next(err);
  }
}

// DELETE /availabilities/one  (body OR query: { employeeId, dayOfWeek })
export async function deleteOne(req, res, next) {
  try {
    if (!isManager(req.user)) {
      return res.status(403).json({ message: "Only managers may edit availability." });
    }

    // Delete uses either query/body params so we normalise before validating.
    const src = { ...(req.body || {}), ...(req.query || {}) };
    const { employeeId } = src;
    const dayOfWeek = src.dayOfWeek != null ? Number(src.dayOfWeek) : null;

    if (!employeeId || dayOfWeek == null) {
      return res.status(400).json({ message: "employeeId and dayOfWeek required" });
    }

    if (!canAccessEmployee(req.user, employeeId)) {
      return res.status(403).json({ message: "You do not have access to that employee." });
    }

    await col().deleteOne({ employeeId, dayOfWeek }); // idempotent
    return res.status(204).end();                     // ALWAYS success
  } catch (err) { next(err); }
}
