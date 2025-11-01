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
      return `This is the very first begining of the ${this.name} channel`
    },
  },
  description: {
    type: String,
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
}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model("Channel", channelSchema);