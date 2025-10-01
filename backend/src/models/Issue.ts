
import mongoose from 'mongoose';

export interface IIssue extends mongoose.Document {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
  images: string[];
  createdBy: mongoose.Types.ObjectId;
  response?: {
    text: string;
    images: string[];
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  };
}

const issueSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  response: {
    text: String,
    images: [String],
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IIssue>('Issue', issueSchema);
