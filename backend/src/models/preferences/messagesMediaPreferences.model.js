import mongoose from 'mongoose';

const messagesMediaPreferencesSchema = new mongoose.Schema(
  {
    showImagesFiles: {
      type: Boolean,
      default: true,
    },
    showImagesLinked: {
      type: Boolean,
      default: true,
    },
    showImagesLarge: {
      type: Boolean,
      default: false,
    },
    showTextPreviews: {
      type: Boolean,
      default: true,
    },
    // Note: displayTypingIndicator is managed in AppearancePreferences
    // to avoid duplication. Frontend should reference appearance.displayTypingIndicator
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('MessagesMediaPreferences', messagesMediaPreferencesSchema);

