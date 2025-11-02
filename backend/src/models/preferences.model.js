import mongoose from 'mongoose';

const preferencesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },
    notifications: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NotificationPreferences',
      default: null,
    },
    vip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VIPPreferences',
      default: null,
    },
    navigation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NavigationPreferences',
      default: null,
    },
    home: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HomePreferences',
      default: null,
    },
    appearance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppearancePreferences',
      default: null,
    },
    messagesMedia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessagesMediaPreferences',
      default: null,
    },
    languageRegion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LanguageRegionPreferences',
      default: null,
    },
    accessibility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccessibilityPreferences',
      default: null,
    },
    markAsRead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarkAsReadPreferences',
      default: null,
    },
    audioVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AudioVideoPreferences',
      default: null,
    },
    privacyVisibility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrivacyVisibilityPreferences',
      default: null,
    },
    slackAI: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SlackAIPreferences',
      default: null,
    },
    advanced: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdvancedPreferences',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('Preferences', preferencesSchema);
