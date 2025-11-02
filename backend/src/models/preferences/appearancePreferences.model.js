import mongoose from 'mongoose';

const appearancePreferencesSchema = new mongoose.Schema(
  {
    font: {
      type: String,
      default: 'Lato (Default)',
    },
    colorMode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    theme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
      default: null,
    },
    displayTypingIndicator: {
      type: Boolean,
      default: true,
    },
    displayColorSwatches: {
      type: Boolean,
      default: true,
    },
    emojiSkinTone: {
      type: String,
      enum: ['default', 'light', 'medium_light', 'medium', 'medium_dark', 'dark'],
      default: 'default',
    },
    displayEmojiAsText: {
      type: Boolean,
      default: false,
    },
    showJumbomoji: {
      type: Boolean,
      default: true,
    },
    convertEmoticons: {
      type: Boolean,
      default: true,
    },
    showOneClickReactions: {
      type: Boolean,
      default: true,
    },
    customReactionEmojis: {
      type: [String],
      default: ['white_check_mark', 'speech_balloon', 'raised_hands'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('AppearancePreferences', appearancePreferencesSchema);

