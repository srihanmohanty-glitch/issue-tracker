"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Delete all @example.com accounts
router.delete('/cleanup', async (req, res) => {
    try {
        const result = await User_1.default.deleteMany({ email: /.*@example\.com$/ });
        res.json({ message: `Deleted ${result.deletedCount} example accounts` });
    }
    catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ message: 'Error cleaning up example accounts' });
    }
});
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Set admin role for specific email
        const role = email === 'admin@helpcenter.com' ? 'admin' : 'user';
        const user = new User_1.default({ email, password, role });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, JWT_SECRET);
        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: 'Error creating user' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, JWT_SECRET);
        res.json({
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: 'Error logging in' });
    }
});
exports.default = router;
