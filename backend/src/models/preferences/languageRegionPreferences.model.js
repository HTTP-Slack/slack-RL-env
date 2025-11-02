import mongoose from 'mongoose';

const languageRegionPreferencesSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      default: 'English (US)',
    },
    timezone: {
      type: String,
      default: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
    },
    autoTimezone: {
      type: Boolean,
      default: true,
    },
    keyboardLayout: {
      type: String,
      default: 'English (US)',
    },
    spellcheck: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('LanguageRegionPreferences', languageRegionPreferencesSchema);

