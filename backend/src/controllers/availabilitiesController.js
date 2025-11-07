// backend/src/controllers/availabilitiesController.js
import { getDb } from "../db/mongo.js";

const col = () => getDb().collection("availabilities");

// GET /availabilities?employeeId=...
export async function listByEmployee(req, res, next) {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ message: "employeeId required" });

    const docs = await col().find({ employeeId }).sort({ dayOfWeek: 1 }).toArray();
    res.json({ data: docs });
  } catch (err) { next(err); }
}

// POST /availabilities
// If start/end are blank → delete that day (idempotent)
export async function upsertOne(req, res, next) {
  try {
    const { employeeId, dayOfWeek, startTime, endTime } = req.body || {};
    if (!employeeId || dayOfWeek == null) {
      return res.status(400).json({ message: "employeeId and dayOfWeek required" });
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
    const src = { ...(req.body || {}), ...(req.query || {}) };
    const { employeeId } = src;
    const dayOfWeek = src.dayOfWeek != null ? Number(src.dayOfWeek) : null;

    if (!employeeId || dayOfWeek == null) {
      return res.status(400).json({ message: "employeeId and dayOfWeek required" });
    }

    await col().deleteOne({ employeeId, dayOfWeek }); // idempotent
    return res.status(204).end();                     // ALWAYS success
  } catch (err) { next(err); }
}