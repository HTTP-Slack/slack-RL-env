import mongoose from 'mongoose';

const canvasSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a canvas title'],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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
    isTemplate: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
    lastViewed: {
      type: Date,
      default: Date.now,
    },
    starredBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isCanvas: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('Canvas', canvasSchema);

