import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a list title'],
    },
    description: {
      type: String,
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: [true, 'Organisation is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isList: {
      type: Boolean,
      default: true,
    },
    columns: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['text', 'enum', 'date', 'bool', 'int'],
          required: true,
        },
        options: [String], // For enum type
        required: {
          type: Boolean,
          default: false,
        },
      },
    ],
    template: {
      type: String,
    },
    lastViewedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('List', listSchema);

