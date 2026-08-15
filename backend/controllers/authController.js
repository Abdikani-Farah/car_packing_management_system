import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';

// Login User
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isDbConnected()) {
      const user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials. Check email and password.' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
      }

      const userResponse = { ...user };
      delete userResponse.password;

      return res.json({
        message: 'Login successful',
        user: userResponse,
        token: user._id,
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials. Check email and password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      message: 'Login successful',
      user: userObj,
      token: user._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

// Register User
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = role && ['admin', 'manager', 'attendant', 'customer'].includes(role) ? role : 'customer';

    if (!isDbConnected()) {
      const existing = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const newUser = {
        _id: `usr-${Date.now()}`,
        name,
        email: cleanEmail,
        password,
        role: assignedRole,
        phone: phone || '',
        status: 'active',
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        createdAt: new Date().toISOString(),
      };

      memoryStore.users.push(newUser);

      const userResponse = { ...newUser };
      delete userResponse.password;

      return res.status(201).json({
        message: 'Registration successful',
        user: userResponse,
        token: newUser._id,
      });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email: cleanEmail,
      password,
      role: assignedRole,
      phone: phone || '',
      status: 'active',
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      message: 'Registration successful',
      user: userObj,
      token: newUser._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getMe = async (req, res, next) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!isDbConnected()) {
      const user = memoryStore.users.find((u) => u._id === userId || u.email === userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const userResponse = { ...user };
      delete userResponse.password;
      return res.json(userResponse);
    }

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Get all users (Admin / Manager)
export const getUsers = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const list = memoryStore.users.map((u) => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
      return res.json(list);
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Create a new staff account (Admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = role || 'attendant';

    if (!isDbConnected()) {
      const existing = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const newUser = {
        _id: `usr-${Date.now()}`,
        name,
        email: cleanEmail,
        password,
        role: assignedRole,
        phone: phone || '',
        status: 'active',
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        createdAt: new Date().toISOString(),
      };

      memoryStore.users.push(newUser);

      const userResponse = { ...newUser };
      delete userResponse.password;
      return res.status(201).json(userResponse);
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email: cleanEmail,
      password,
      role: assignedRole,
      phone: phone || '',
      status: 'active',
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
  } catch (error) {
    next(error);
  }
};

// Update user role or status (Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    if (!isDbConnected()) {
      const index = memoryStore.users.findIndex((u) => u._id === id);
      if (index === -1) return res.status(404).json({ message: 'User not found' });

      if (role) memoryStore.users[index].role = role;
      if (status) memoryStore.users[index].status = status;

      const updated = { ...memoryStore.users[index] };
      delete updated.password;
      return res.json(updated);
    }

    const updateFields = {};
    if (role) updateFields.role = role;
    if (status) updateFields.status = status;

    const updated = await User.findByIdAndUpdate(id, updateFields, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete user account (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const index = memoryStore.users.findIndex((u) => u._id === id);
      if (index === -1) return res.status(404).json({ message: 'User not found' });

      memoryStore.users.splice(index, 1);
      return res.json({ message: 'User account removed successfully' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User account removed successfully' });
  } catch (error) {
    next(error);
  }
};
