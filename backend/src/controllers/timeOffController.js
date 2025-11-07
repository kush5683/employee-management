import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo.js';
import { canAccessEmployee, getAccessibleEmployeeIds, isManager, forbidden } from '../utils/accessControl.js';

const COLLECTION = 'time_off_requests';

export const listTimeOffRequests = async (req, res) => {
  // Shared list endpoint that automatically scopes data based on the JWT.
  const db = getDb();
  const accessibleIds = getAccessibleEmployeeIds(req.user);
  const query = accessibleIds.length ? { employeeId: { $in: accessibleIds } } : { employeeId: '__none__' };
  const items = await db.collection(COLLECTION).find(query).sort({ startDate: 1 }).toArray();
  res.json({ data: items.map(normalise) });
};

export const createTimeOffRequest = async (req, res, next) => {
  try {
    const { startDate, endDate, reason = '' } = req.body;
    let targetEmployeeId = req.body.employeeId;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required.' });
    }

    if (!isManager(req.user)) {
      targetEmployeeId = req.user?.sub;
    }

    // Managers can raise requests on behalf of direct reports; employees always act on themselves.
    if (!targetEmployeeId) {
      return res.status(400).json({ message: 'employeeId is required.' });
    }

    if (!canAccessEmployee(req.user, targetEmployeeId)) {
      throw forbidden('You do not have access to that employee.');
    }

    const db = getDb();
    const doc = {
      employeeId: targetEmployeeId,
      startDate,
      endDate,
      reason,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { insertedId } = await db.collection(COLLECTION).insertOne(doc);
    res.status(201).json({ data: { ...doc, id: insertedId.toString() } });
  } catch (error) {
    next(error);
  }
};

export const updateTimeOffStatus = async (req, res, next) => {
  try {
    if (!isManager(req.user)) {
      throw forbidden('Only managers may update request status.');
    }

    // Status updates must target a document the manager already oversees.
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const accessibleIds = getAccessibleEmployeeIds(req.user);
    const db = getDb();
    const existing = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });

    if (!existing || !isEmployeeAccessible(existing.employeeId, accessibleIds)) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const result = await db
      .collection(COLLECTION)
      .findOneAndUpdate(
        { _id: existing._id },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

    res.json({ data: normalise(result.value) });
  } catch (error) {
    next(error);
  }
};

export const deleteTimeOffRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accessibleIds = getAccessibleEmployeeIds(req.user);
    const db = getDb();
    const existing = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });

    if (!existing || !isEmployeeAccessible(existing.employeeId, accessibleIds)) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    await db.collection(COLLECTION).deleteOne({ _id: existing._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

function normalise(doc) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function isEmployeeAccessible(employeeId, accessibleIds) {
  if (!employeeId) return false;
  const value = typeof employeeId === 'string' ? employeeId : employeeId.toString();
  return accessibleIds.includes(value);
}
