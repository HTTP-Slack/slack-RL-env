import mongoose from 'mongoose';

const listItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter an item name'],
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: [true, 'List ID is required'],
    },
    status: {
      type: String,
      enum: ['Not started', 'In progress', 'Blocked', 'Completed'],
    },
    priority: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    description: {
      type: String,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('ListItem', listItemSchema);

