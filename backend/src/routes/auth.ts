import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Delete all @example.com accounts
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await User.deleteMany({ email: /.*@example\.com$/ });
    res.json({ message: `Deleted ${result.deletedCount} example accounts` });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Error cleaning up example accounts' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Set admin role for specific email
    const role = email === 'admin@helpcenter.com' ? 'admin' : 'user';

    const user = new User({ email, password, role });
    await user.save();

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.status(201).json({ 
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }, 
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: 'Error creating user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(401).json({ message: 'Account is temporarily locked due to too many failed login attempts' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update user activity
    await User.findByIdAndUpdate(user._id, {
      $inc: { 
        'activity.totalLogins': 1 
      },
      $set: { 
        lastLogin: new Date(),
        'activity.lastActivity': new Date()
      }
    });

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.json({ 
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: 'Error logging in' });
  }
});

export default router;