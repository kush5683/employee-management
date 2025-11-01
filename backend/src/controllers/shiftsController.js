import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo.js';

const COLLECTION = 'shifts';

export const listShifts = async (_req, res) => {
  const db = getDb();
  const items = await db.collection(COLLECTION).find().sort({ date: 1, startTime: 1 }).toArray();
  res.json({ data: items.map(normalise) });
};

export const createShift = async (req, res) => {
  const { employeeId, date, startTime, endTime, location = '', status = 'scheduled' } = req.body;

  if (!employeeId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'employeeId, date, startTime, and endTime are required.' });
  }

  const db = getDb();
  const doc = {
    employeeId,
    date,
    startTime,
    endTime,
    location,
    status,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const { insertedId } = await db.collection(COLLECTION).insertOne(doc);
  res.status(201).json({ data: { ...doc, id: insertedId.toString() } });
};

export const updateShift = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updatedAt: new Date() };

  const db = getDb();
  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updates }, { returnDocument: 'after' });

  if (!result.value) {
    return res.status(404).json({ message: 'Shift not found.' });
  }

  res.json({ data: normalise(result.value) });
};

export const deleteShift = async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const outcome = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });

  if (!outcome.deletedCount) {
    return res.status(404).json({ message: 'Shift not found.' });
  }

  res.status(204).send();
};

function normalise(doc) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}
