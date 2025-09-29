import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth, adminAuth } from '../middleware/auth';
import Issue from '../models/Issue';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Get all issues
router.get('/', auth, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('createdBy', 'email')
      .populate('response.respondedBy', 'email')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues' });
  }
});

// Create new issue
router.post('/', auth, upload.array('images', 5), async (req: any, res) => {
  try {
    const { title, description, priority } = req.body;
    const images = req.files ? req.files.map((file: any) => file.path) : [];

    const issue = new Issue({
      title,
      description,
      priority,
      images,
      createdBy: req.user._id
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ message: 'Error creating issue' });
  }
});

// Add response to an issue
router.post('/:id/response', adminAuth, upload.array('images', 5), async (req: any, res) => {
  try {
    const { text } = req.body;
    const images = req.files ? req.files.map((file: any) => file.path) : [];

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.response = {
      text,
      images,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };
    issue.status = 'resolved';

    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: 'Error adding response' });
  }
});

// Update issue status
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: 'Error updating issue status' });
  }
});

// Delete issue (admin only, and only if resolved)
router.delete('/:id', adminAuth, async (req: any, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.status !== 'resolved') {
      return res.status(400).json({ message: 'Can only delete resolved issues' });
    }

    // Delete associated images
    const deleteImage = (imagePath: string) => {
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error(`Error deleting image ${imagePath}:`, err);
      }
    };

    // Delete issue images
    if (issue.images) {
      issue.images.forEach(deleteImage);
    }

    // Delete response images
    if (issue.response && issue.response.images) {
      issue.response.images.forEach(deleteImage);
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting issue' });
  }
});

export default router;