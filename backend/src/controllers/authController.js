import { getDb } from '../db/mongo.js';
import { signToken } from '../utils/jwt.js';
import { verifyPassword } from '../utils/password.js';

const employeesCol = () => getDb().collection('employees');

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

    const isManager = Boolean(user.isManager);
    let managedEmployeeIds = [];

    if (isManager) {
      const managed = await employeesCol()
        .find({ managerId: user._id }, { projection: { _id: 1 } })
        .toArray();
      managedEmployeeIds = managed.map((doc) => doc._id.toString());
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
