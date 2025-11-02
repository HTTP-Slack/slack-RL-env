import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theme name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['single_colour', 'vision_assistive', 'fun_and_new', 'custom'],
      required: [true, 'Theme category is required'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    // For custom themes - store color values
    colors: {
      systemNavigation: {
        type: String,
        default: null,
      },
      presenceIndication: {
        type: String,
        default: null,
      },
      selectedItems: {
        type: String,
        default: null,
      },
      notifications: {
        type: String,
        default: null,
      },
    },
    windowGradient: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster queries
themeSchema.index({ category: 1 });
themeSchema.index({ isDefault: 1 });
themeSchema.index({ createdBy: 1 });

export default mongoose.model('Theme', themeSchema);

