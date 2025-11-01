import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  message: mongoose.Schema.Types.ObjectId,
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
  isBookmarked: {
    type: Boolean,
    default: false,
  },
  hasRead: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model("Thread", threadSchema);