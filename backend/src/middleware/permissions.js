import { isManager } from '../utils/accessControl.js';

export function requireManager(req, res, next) {
  if (!isManager(req.user)) {
    return res.status(403).json({ message: 'Managers only.' });
  }
  next();
}
