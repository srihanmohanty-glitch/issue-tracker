"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const Issue_1 = __importDefault(require("../models/Issue"));
const router = express_1.default.Router();
// Configure multer for image upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});
// Get all issues
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const issues = await Issue_1.default.find()
            .populate('createdBy', 'email')
            .populate('response.respondedBy', 'email')
            .sort({ createdAt: -1 });
        res.json(issues);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching issues' });
    }
});
// Create new issue
router.post('/', auth_1.auth, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const images = req.files ? req.files.map((file) => file.path) : [];
        const issue = new Issue_1.default({
            title,
            description,
            priority,
            images,
            createdBy: req.user._id
        });
        await issue.save();
        res.status(201).json(issue);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating issue' });
    }
});
// Add response to an issue
router.post('/:id/response', auth_1.adminAuth, upload.array('images', 5), async (req, res) => {
    try {
        const { text } = req.body;
        const images = req.files ? req.files.map((file) => file.path) : [];
        const issue = await Issue_1.default.findById(req.params.id);
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
    }
    catch (error) {
        res.status(400).json({ message: 'Error adding response' });
    }
});
// Update issue status
router.patch('/:id/status', auth_1.adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const issue = await Issue_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.json(issue);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating issue status' });
    }
});
// Delete issue (admin only, and only if resolved)
router.delete('/:id', auth_1.adminAuth, async (req, res) => {
    try {
        const issue = await Issue_1.default.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        if (issue.status !== 'resolved') {
            return res.status(400).json({ message: 'Can only delete resolved issues' });
        }
        // Delete associated images
        const deleteImage = (imagePath) => {
            try {
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            catch (err) {
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
        await Issue_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Issue deleted successfully' });
    }
    catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Error deleting issue' });
    }
});
exports.default = router;
