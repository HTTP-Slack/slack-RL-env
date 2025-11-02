import mongoose from 'mongoose'

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your channel name'],
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  title: {
    type: String,
    default() {
      return `This is the very first beginning of the ${this.name} channel`
    },
  },
  description: {
    type: String,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
  },
  hasNotOpen: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  isChannel: {
    type: Boolean,
    default: true,
  },
  starred: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model("Channel", channelSchema);