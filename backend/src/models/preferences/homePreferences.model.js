import mongoose from 'mongoose';

const homePreferencesSchema = new mongoose.Schema(
  {
    showChannelOrganization: {
      type: Boolean,
      default: true,
    },
    showActivityDot: {
      type: Boolean,
      default: true,
    },
    alwaysShowUnreads: {
      type: Boolean,
      default: false,
    },
    alwaysShowHuddles: {
      type: Boolean,
      default: true,
    },
    alwaysShowThreads: {
      type: Boolean,
      default: true,
    },
    alwaysShowDraftsSent: {
      type: Boolean,
      default: true,
    },
    alwaysShowDirectories: {
      type: Boolean,
      default: true,
    },
    show: {
      type: String,
      enum: ['all', 'unreads', 'mentions', 'custom'],
      default: 'all',
    },
    sort: {
      type: String,
      enum: ['alphabetically', 'most_recent', 'priority'],
      default: 'alphabetically',
    },
    showProfilePhotos: {
      type: Boolean,
      default: true,
    },
    separatePrivateChannels: {
      type: Boolean,
      default: false,
    },
    separateDirectMessages: {
      type: Boolean,
      default: false,
    },
    moveUnreadMentions: {
      type: Boolean,
      default: true,
    },
    organizeExternalConversations: {
      type: Boolean,
      default: true,
    },
    displayMutedItems: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('HomePreferences', homePreferencesSchema);

