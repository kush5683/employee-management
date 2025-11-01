import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo.js';

const COLLECTION = 'time_off_requests';

export const listTimeOffRequests = async (_req, res) => {
  const db = getDb();
  const items = await db.collection(COLLECTION).find().sort({ startDate: 1 }).toArray();
  res.json({ data: items.map(normalise) });
};

export const createTimeOffRequest = async (req, res) => {
  const { employeeId, startDate, endDate, reason = '' } = req.body;

  if (!employeeId || !startDate || !endDate) {
    return res.status(400).json({ message: 'employeeId, startDate, and endDate are required.' });
  }

  const db = getDb();
  const doc = {
    employeeId,
    startDate,
    endDate,
    reason,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const { insertedId } = await db.collection(COLLECTION).insertOne(doc);
  res.status(201).json({ data: { ...doc, id: insertedId.toString() } });
};

export const updateTimeOffStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  const db = getDb();
  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

  if (!result.value) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  res.json({ data: normalise(result.value) });
};

export const deleteTimeOffRequest = async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const outcome = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });

  if (!outcome.deletedCount) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  res.status(204).send();
};

function normalise(doc) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}
