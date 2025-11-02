import mongoose from 'mongoose';

const notificationPreferencesSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['all', 'direct_mentions_keywords', 'nothing'],
      required: [true, 'Notification type is required'],
      default: 'all',
    },
    differentMobileSettings: {
      type: Boolean,
      default: false,
    },
    huddles: {
      type: Boolean,
      default: true,
    },
    threadReplies: {
      type: Boolean,
      default: true,
    },
    keywords: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('NotificationPreferences', notificationPreferencesSchema);

