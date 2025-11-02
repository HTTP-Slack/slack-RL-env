import mongoose from 'mongoose';

const markAsReadPreferencesSchema = new mongoose.Schema(
  {
    behavior: {
      type: String,
      enum: ['start_where_left', 'start_newest_mark', 'start_newest_leave'],
      default: 'start_where_left',
    },
    promptOnMarkAll: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('MarkAsReadPreferences', markAsReadPreferencesSchema);

