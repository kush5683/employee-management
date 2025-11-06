import { getDb } from "../db/mongo.js";
import { ObjectId } from "mongodb";

const employeesCol = () => getDb().collection("employees");

export async function listEmployees(req, res, next) {
  try {
    const docs = await employeesCol().find({}).sort({ name: 1 }).toArray();
    res.json({ data: docs });                     // <-- wrap in {data: ...}
  } catch (err) { next(err); }
}

export async function createEmployee(req, res, next) {
  try {
    const { name, email, role, location, hourlyRate, eligible = true } = req.body;
    if (!name || !email) return res.status(400).json({ message: "name and email required" });

    const doc = {
      name,
      email,
      role,
      location,
      hourlyRate: Number(hourlyRate) || 0,
      eligible,
      active: true,
      createdAt: new Date(),
    };

    const { insertedId } = await employeesCol().insertOne(doc);
    res.status(201).json({ data: { _id: insertedId, ...doc } });   // <-- {data: ...}
  } catch (err) { next(err); }
}

export async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const update = req.body;
    const result = await employeesCol().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
    if (!result.value) return res.status(404).json({ message: "not found" });
    res.json({ data: result.value });             // <-- {data: ...}
  } catch (err) { next(err); }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const del = await employeesCol().deleteOne({ _id: new ObjectId(id) });
    if (!del.deletedCount) return res.status(404).json({ message: "not found" });
    res.status(204).end();
  } catch (err) { next(err); }
}