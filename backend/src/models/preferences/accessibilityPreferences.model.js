import mongoose from 'mongoose';

const accessibilityPreferencesSchema = new mongoose.Schema(
  {
    simplifiedLayoutMode: {
      type: Boolean,
      default: false,
    },
    underlineLinks: {
      type: Boolean,
      default: false,
    },
    tabPreviews: {
      type: Boolean,
      default: true,
    },
    autoPlayAnimations: {
      type: Boolean,
      default: true,
    },
    messageFormat: {
      type: String,
      enum: ['sender_message_date', 'sender_date_message'],
      default: 'sender_message_date',
    },
    announceIncomingMessages: {
      type: Boolean,
      default: true,
    },
    readEmojiReactions: {
      type: Boolean,
      default: true,
    },
    playEmojiSound: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('AccessibilityPreferences', accessibilityPreferencesSchema);

