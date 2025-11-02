import mongoose from 'mongoose';

const advancedPreferencesSchema = new mongoose.Schema(
  {
    // Input options
    whenTypingCodeEnterShouldNotSend: {
      type: Boolean,
      default: false,
    },
    formatMessagesWithMarkup: {
      type: Boolean,
      default: false,
    },
    enterBehavior: {
      type: String,
      enum: ['send', 'newline'],
      default: 'send',
    },
    // Search options
    ctrlFStartsSearch: {
      type: Boolean,
      default: false,
    },
    searchShortcut: {
      type: String,
      enum: ['cmd_f', 'cmd_k'],
      default: 'cmd_k',
    },
    excludeChannelsFromSearch: {
      type: [String],
      default: [],
    },
    // Sort option default
    searchSortDefault: {
      type: String,
      enum: ['most_relevant', 'last_used'],
      default: 'most_relevant',
    },
    // Confirmations and warnings
    confirmUnsend: {
      type: Boolean,
      default: true,
    },
    confirmAwayToggle: {
      type: Boolean,
      default: true,
    },
    warnMaliciousLinks: {
      type: Boolean,
      default: true,
    },
    warnExternalFiles: {
      type: Boolean,
      default: true,
    },
    warnExternalCanvases: {
      type: Boolean,
      default: true,
    },
    // Other options
    channelSuggestions: {
      type: Boolean,
      default: true,
    },
    surveys: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('AdvancedPreferences', advancedPreferencesSchema);

