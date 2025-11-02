import mongoose from 'mongoose';

const laterItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['in-progress', 'archived', 'completed'],
    default: 'in-progress',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: [true, 'Organisation ID is required'],
  },
  dueDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Index for faster queries
laterItemSchema.index({ userId: 1, organisation: 1, status: 1 });

export default mongoose.model('LaterItem', laterItemSchema);
