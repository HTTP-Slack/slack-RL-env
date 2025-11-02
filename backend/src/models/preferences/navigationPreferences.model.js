import mongoose from 'mongoose';

const navigationPreferencesSchema = new mongoose.Schema(
  {
    showHome: {
      type: Boolean,
      default: true,
    },
    showDMs: {
      type: Boolean,
      default: true,
    },
    showActivity: {
      type: Boolean,
      default: true,
    },
    showFiles: {
      type: Boolean,
      default: true,
    },
    showTools: {
      type: Boolean,
      default: false,
    },
    tabAppearance: {
      type: String,
      enum: ['icons_text', 'icons_only'],
      default: 'icons_text',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('NavigationPreferences', navigationPreferencesSchema);

