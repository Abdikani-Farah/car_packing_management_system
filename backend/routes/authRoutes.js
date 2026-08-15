import express from 'express';
import {
  login,
  register,
  getMe,
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
} from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);

// User Management Routes (Admin / Manager)
router.get('/users', protect, restrictTo('admin', 'manager'), getUsers);
router.post('/users', protect, restrictTo('admin'), createUser);
router.put('/users/:id/role', protect, restrictTo('admin'), updateUserRole);
router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);

export default router;
