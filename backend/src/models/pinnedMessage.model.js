import mongoose from 'mongoose';

const pinnedMessageSchema = new mongoose.Schema({
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true,
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true,
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Ensure a message can only be pinned once per channel/conversation
pinnedMessageSchema.index({ message: 1, channel: 1 }, { unique: true, sparse: true });
pinnedMessageSchema.index({ message: 1, conversation: 1 }, { unique: true, sparse: true });

export default mongoose.model('PinnedMessage', pinnedMessageSchema);
