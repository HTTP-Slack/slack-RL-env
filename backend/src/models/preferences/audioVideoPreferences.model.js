import mongoose from 'mongoose';

const audioVideoPreferencesSchema = new mongoose.Schema(
  {
    microphoneDevice: {
      type: String,
      default: 'default',
    },
    speakerDevice: {
      type: String,
      default: 'default',
    },
    cameraDevice: {
      type: String,
      default: 'default',
    },
    // When joining a huddle...
    setStatusToInHuddle: {
      type: Boolean,
      default: true,
    },
    muteMicrophoneOnJoin: {
      type: Boolean,
      default: false,
    },
    autoTurnOnCaptions: {
      type: Boolean,
      default: false,
    },
    warnLargeChannel: {
      type: Boolean,
      default: true,
    },
    blurVideoBackground: {
      type: Boolean,
      default: false,
    },
    // When alone in a huddle...
    playMusic: {
      type: Boolean,
      default: true,
    },
    musicStartDelay: {
      type: String,
      default: '1 minute', // e.g., '1 minute', '2 minutes', etc.
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('AudioVideoPreferences', audioVideoPreferencesSchema);

