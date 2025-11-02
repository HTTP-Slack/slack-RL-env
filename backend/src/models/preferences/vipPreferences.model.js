import mongoose from 'mongoose';

const vipPreferencesSchema = new mongoose.Schema(
  {
    allowFromVIPs: {
      type: Boolean,
      default: false,
    },
    vipList: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('VIPPreferences', vipPreferencesSchema);

