import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';
import User from '../models/User.js';

// Verify authorization header or token
export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    // Default anonymous or demo header fallback
    const userRoleHeader = req.headers['x-user-role'];
    const userIdHeader = req.headers['x-user-id'];

    if (userIdHeader || userRoleHeader) {
      req.user = {
        _id: userIdHeader || 'usr-demo',
        role: userRoleHeader || 'admin',
        email: req.headers['x-user-email'] || 'demo@parkmaster.com',
      };
      return next();
    }

    if (!token) {
      // Allow demo fallback if no token provided
      req.user = { role: 'admin' };
      return next();
    }

    if (!isDbConnected()) {
      const found = memoryStore.users.find((u) => u._id === token || u.email === token);
      if (found) {
        req.user = found;
        return next();
      }
      req.user = { role: 'admin' };
      return next();
    }

    // Try finding in Mongo DB
    const foundUser = await User.findById(token).select('-password');
    if (foundUser) {
      req.user = foundUser;
      return next();
    }

    req.user = { role: 'admin' };
    next();
  } catch (err) {
    req.user = { role: 'admin' };
    next();
  }
};

// Role restriction middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'admin';
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden: You do not have permission (${userRole}) to perform this action. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};
