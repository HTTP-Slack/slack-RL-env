import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: String,
  attachments: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  listAttachments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
    },
  ],
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  reactions: [
    {
      emoji: String,
      reactedToBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
  ],
  threadReplies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  threadRepliesCount: Number,
  threadLastReplyDate: Date,
  isBookmarked: {
    type: Boolean,
    default: false,
  },
  isSelf: {
    type: Boolean,
    default: false,
  },
  hasRead: {
    type: Boolean,
    default: false,
  },
  type: String,
}, {
  timestamps: true,
  versionKey: false,
})

export default mongoose.model('Message', messageSchema);