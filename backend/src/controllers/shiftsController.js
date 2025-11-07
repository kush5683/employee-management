import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo.js';
import { canAccessEmployee, getAccessibleEmployeeIds, isManager, forbidden } from '../utils/accessControl.js';

const COLLECTION = 'shifts';

export const listShifts = async (req, res) => {
  // Each user only receives shifts they are entitled to view. Managers see
  // themselves and managed employees, while individual contributors only see self.
  const db = getDb();
  const accessibleIds = getAccessibleEmployeeIds(req.user);
  const query = accessibleIds.length ? { employeeId: { $in: accessibleIds } } : { employeeId: '__none__' };
  const items = await db.collection(COLLECTION).find(query).sort({ date: 1, startTime: 1 }).toArray();
  res.json({ data: items.map(normalise) });
};

export const createShift = async (req, res, next) => {
  try {
    if (!isManager(req.user)) {
      throw forbidden('Only managers may create shifts.');
    }

    // Managers may assign shifts to any employee they already have access to.
    const { employeeId, date, startTime, endTime, location = '', status = 'scheduled' } = req.body;

    if (!employeeId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'employeeId, date, startTime, and endTime are required.' });
    }

    if (!canAccessEmployee(req.user, employeeId)) {
      throw forbidden('You do not manage that employee.');
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
  } catch (error) {
    next(error);
  }
};

export const updateShift = async (req, res, next) => {
  try {
    if (!isManager(req.user)) {
      throw forbidden('Only managers may update shifts.');
    }

    // Restrict the update query so a manager cannot tamper with someone else’s records.
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    const accessibleIds = getAccessibleEmployeeIds(req.user);

    const db = getDb();
    const result = await db
      .collection(COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(id), employeeId: { $in: accessibleIds } },
        { $set: updates },
        { returnDocument: 'after' }
      );

    if (!result.value) {
      return res.status(404).json({ message: 'Shift not found.' });
    }

    res.json({ data: normalise(result.value) });
  } catch (error) {
    next(error);
  }
};

export const deleteShift = async (req, res, next) => {
  try {
    if (!isManager(req.user)) {
      throw forbidden('Only managers may remove shifts.');
    }

    // Only delete documents that fall inside the manager's allowed employee id set.
    const { id } = req.params;
    const accessibleIds = getAccessibleEmployeeIds(req.user);
    const db = getDb();
    const outcome = await db.collection(COLLECTION).deleteOne({
      _id: new ObjectId(id),
      employeeId: { $in: accessibleIds }
    });

    if (!outcome.deletedCount) {
      return res.status(404).json({ message: 'Shift not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

function normalise(doc) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}
