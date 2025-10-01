import express, { Request, Response, NextFunction } from 'express';
import { auth, adminAuth, managerAuth } from '../middleware/auth';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';

interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Get current user info (for token validation)
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(400).json({ message: 'Error fetching user info' });
  }
});

// Get all users (admin/manager only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Users can only view their own profile unless they're admin/manager
    if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Create new user (admin/manager only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, profile } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      email,
      password,
      role: role || 'user',
      firstName,
      lastName,
      profile: profile || {}
    });

    await user.save();
    
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
});

// Update user (admin/manager or self)
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, profile, isActive, role, permissions } = req.body;
    
    // Check permissions
    const isAdmin = req.user?.role === 'admin';
    const isManager = req.user?.role === 'manager';
    const isSelf = req.user?._id.toString() === req.params.id;
    
    if (!isAdmin && !isManager && !isSelf) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (profile !== undefined) updateData.profile = profile;
    
    // Only admin/manager can change these fields
    if (isAdmin || isManager) {
      if (isActive !== undefined) updateData.isActive = isActive;
      if (role !== undefined) updateData.role = role;
      if (permissions !== undefined) updateData.permissions = permissions;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user' });
  }
});

// Change password
router.put('/:id/password', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?._id.toString() === req.params.id;
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password (unless admin changing someone else's password)
    if (!isAdmin || isSelf) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating password' });
  }
});

// Reset login attempts (admin/manager only)
router.post('/:id/reset-login-attempts', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.resetLoginAttempts();
    res.json({ message: 'Login attempts reset successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error resetting login attempts' });
  }
});

// Bulk operations (admin only)
router.post('/bulk', adminAuth, async (req, res) => {
  try {
    const { action, userIds, data } = req.body;
    
    let result;
    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: true } }
        );
        break;
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: false } }
        );
        break;
      case 'change-role':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { role: data.role } }
        );
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds } });
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ 
      message: `Bulk ${action} completed successfully`,
      modifiedCount: (result as any).modifiedCount || (result as any).deletedCount
    });
  } catch (error) {
    res.status(400).json({ message: 'Error performing bulk operation' });
  }
});

// Get user statistics (admin/manager only)
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const managerUsers = await User.countDocuments({ role: 'manager' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    const recentLogins = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const lockedAccounts = await User.countDocuments({
      lockUntil: { $gt: new Date() }
    });

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      managerUsers,
      regularUsers,
      recentLogins,
      lockedAccounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

export default router;
