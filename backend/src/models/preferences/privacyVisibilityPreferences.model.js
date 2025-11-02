import mongoose from 'mongoose';

const privacyVisibilityPreferencesSchema = new mongoose.Schema(
  {
    slackConnectDiscoverable: {
      type: Boolean,
      default: true,
    },
    contactSharing: {
      type: String,
      enum: ['all', 'workspace_only', 'none'],
      default: 'all',
    },
    blockedInvitations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hiddenPeople: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('PrivacyVisibilityPreferences', privacyVisibilityPreferencesSchema);

