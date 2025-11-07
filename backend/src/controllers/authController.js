import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo.js';
import { signToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const employeesCol = () => getDb().collection('employees');
const ROLE_MANAGER_REGEX = /(manager|supervisor|lead)/i;

function inferManagerFlag(user) {
  if (!user) return false;
  if (typeof user.isManager === 'boolean') {
    return user.isManager;
  }
  if (user.role && ROLE_MANAGER_REGEX.test(user.role)) {
    return true;
  }
  return user.managerId === null;
}

function buildManagerFilters(user) {
  const filters = [];
  if (!user) {
    return filters;
  }
  if (user._id) {
    filters.push({ managerId: user._id });
  }
  if (user.employeeId) {
    filters.push({ managerId: user.employeeId });
    try {
      filters.push({ managerId: new ObjectId(user.employeeId) });
    } catch {
      // ignore invalid ids
    }
  }
  return filters;
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await employeesCol().findOne({ email: normalizedEmail });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    let isManager = inferManagerFlag(user);
    let managedEmployeeIds = [];

    if (isManager) {
      const filters = buildManagerFilters(user);
      let managed = [];

      if (filters.length) {
        managed = await employeesCol()
          .find({ $or: filters }, { projection: { _id: 1 } })
          .toArray();
      }

      // If legacy data does not link direct reports, fall back to full visibility
      // so managers are never blocked from doing their job.
      if (!managed.length) {
        managed = await employeesCol().find({}, { projection: { _id: 1 } }).toArray();
      }

      managedEmployeeIds = managed.map((doc) => doc._id.toString()).filter((id) => id !== user._id.toString());
      if (managedEmployeeIds.length) {
        isManager = true;
      }
    }

    const permissions = {
      scope: isManager ? 'manager' : 'self',
      managedEmployeeIds
    };

    const tokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions
    };

    const token = signToken(tokenPayload);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId ? user.managerId.toString() : null,
        isManager,
        permissions
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const userId = req.user?.sub;
    const { currentPassword, newPassword } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const user = await employeesCol().findOne({ _id: new ObjectId(userId) });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Unable to update password for this user.' });
    }

    const matches = await verifyPassword(currentPassword, user.passwordHash);
    if (!matches) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const newHash = await hashPassword(newPassword);
    await employeesCol().updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: newHash,
          updatedAt: new Date()
        }
      }
    );

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
