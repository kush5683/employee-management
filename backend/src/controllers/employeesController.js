import { getDb } from "../db/mongo.js";
import { ObjectId } from "mongodb";
import { hashPassword } from "../utils/password.js";

const employeesCol = () => getDb().collection("employees");

export async function listEmployees(_req, res, next) {
  try {
    const docs = await employeesCol().find({}).sort({ name: 1 }).toArray();
    res.json({ data: docs.map(serializeEmployee) });
  } catch (err) {
    next(err);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const {
      name,
      email,
      role,
      location,
      hourlyRate,
      eligible = true,
      password,
      managerId = null,
      isManager = false,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "name and email required" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "password must be at least 8 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await employeesCol().findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An employee with that email already exists." });
    }

    const passwordHash = await hashPassword(password);

    const doc = {
      name,
      email: normalizedEmail,
      role,
      location,
      hourlyRate: Number(hourlyRate) || 0,
      eligible,
      active: true,
      isManager: Boolean(isManager),
      managerId: normalizeManagerId(managerId),
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { insertedId } = await employeesCol().insertOne(doc);
    res.status(201).json({ data: serializeEmployee({ _id: insertedId, ...doc }) });
  } catch (err) {
    next(err);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid employee id." });
    }

    const update = { ...req.body };

    if (update.email) {
      update.email = update.email.trim().toLowerCase();
      const duplicate = await employeesCol().findOne({
        email: update.email,
        _id: { $ne: new ObjectId(id) },
      });
      if (duplicate) {
        return res.status(409).json({ message: "An employee with that email already exists." });
      }
    }

    if (update.password) {
      if (update.password.length < 8) {
        return res.status(400).json({ message: "password must be at least 8 characters long" });
      }
      update.passwordHash = await hashPassword(update.password);
      delete update.password;
    }

    if (Object.prototype.hasOwnProperty.call(update, "managerId")) {
      update.managerId = normalizeManagerId(update.managerId);
    }

    if (Object.prototype.hasOwnProperty.call(update, "hourlyRate")) {
      update.hourlyRate = Number(update.hourlyRate) || 0;
    }

    if (Object.prototype.hasOwnProperty.call(update, "eligible")) {
      update.eligible = Boolean(update.eligible);
    }

    if (Object.prototype.hasOwnProperty.call(update, "isManager")) {
      update.isManager = Boolean(update.isManager);
    }

    update.updatedAt = new Date();

    const result = await employeesCol().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "not found" });
    }

    res.json({ data: serializeEmployee(result.value) });
  } catch (err) {
    next(err);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid employee id." });
    }
    const del = await employeesCol().deleteOne({ _id: new ObjectId(id) });
    if (!del.deletedCount) return res.status(404).json({ message: "not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

function serializeEmployee(doc) {
  if (!doc) return null;
  const { _id, managerId, passwordHash, ...rest } = doc;
  return {
    _id: _id?.toString(),
    managerId: managerId ? managerId.toString() : null,
    ...rest,
  };
}

function normalizeManagerId(value) {
  if (!value) return null;
  try {
    return new ObjectId(value);
  } catch {
    return null;
  }
}
