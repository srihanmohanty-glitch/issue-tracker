"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const issueSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved'],
        default: 'pending',
    },
    images: [{
            type: String,
        }],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    response: {
        text: String,
        images: [String],
        respondedBy: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
        respondedAt: Date,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Issue', issueSchema);
