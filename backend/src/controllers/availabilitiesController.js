import { getDb } from "../db/mongo.js";

const col = () => getDb().collection("availabilities");
// Suggested unique index (run once):
// await col().createIndex({ employeeId: 1, dayOfWeek: 1 }, { unique: true });

export async function listByEmployee(req, res, next) {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ message: "employeeId required" });

    const docs = await col()
      .find({ employeeId })
      .sort({ dayOfWeek: 1 })
      .toArray();

    res.json({ data: docs });
  } catch (err) { next(err); }
}

export async function upsertOne(req, res, next) {
  try {
    const { employeeId, dayOfWeek, startTime, endTime } = req.body || {};
    if (!employeeId || dayOfWeek == null || !startTime || !endTime) {
      return res.status(400).json({ message: "employeeId, dayOfWeek, startTime, endTime required" });
    }

    const filter = { employeeId, dayOfWeek: Number(dayOfWeek) };
    const update = {
      $set: {
        employeeId,
        dayOfWeek: Number(dayOfWeek),
        startTime, // "09:00"
        endTime,   // "17:00"
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    };

    const result = await col().findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: "after",
    });

    res.status(result.lastErrorObject?.upserted ? 201 : 200).json({ data: result.value });
  } catch (err) {
    // Handle duplicate key errors cleanly if unique index exists
    if (err?.code === 11000) {
      err.message = "Availability for that day already exists.";
      err.status = 409;
    }
    next(err);
  }
}

export async function deleteOne(req, res, next) {
  try {
    const { employeeId, dayOfWeek } = req.body || {};
    if (!employeeId || dayOfWeek == null) {
      return res.status(400).json({ message: "employeeId and dayOfWeek required" });
    }

    const result = await col().deleteOne({ employeeId, dayOfWeek: Number(dayOfWeek) });
    if (!result.deletedCount) return res.status(404).json({ message: "not found" });

    res.status(204).end();
  } catch (err) { next(err); }
}