import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  name: {
    type: String,
    default() {
      if (this.createdBy) {
        return this.createdBy.username
      }
      return ''
    },
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  description: {
    type: String,
    default() {
      return `This conversation is just between ${this.name} and you`
    },
  },
  isSelf: {
    type: Boolean,
    default: false,
  },
  isConversation: {
    type: Boolean,
    default: true,
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  hasNotOpen: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, {
  timestamps: true,
  versionKey: false,
});

conversationSchema.index({ collaborators: 1 });

export default mongoose.model('Conversations', conversationSchema);