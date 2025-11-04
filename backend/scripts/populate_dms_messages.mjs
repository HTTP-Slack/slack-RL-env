import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/slack_clone_db';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI, { autoIndex: false });
    console.log('Connected');

    const { default: User } = await import('../src/models/user.model.js');
    const { default: Conversations } = await import('../src/models/conversation.model.js');
    const { default: Message } = await import('../src/models/message.model.js');

    const testUser = await User.findOne({ email: 'test@hotmail.com' });
    if (!testUser) {
      console.error('Test user not found. Run create_test_user.mjs first.');
      process.exit(1);
    }

    // pick up to 30 other users to create DMs with
    const others = await User.find({ _id: { $ne: testUser._id } }).limit(30).lean();
    console.log('Found', others.length, 'other users to create DMs with');

    let totalConvs = 0;
    let totalMsgs = 0;

    for (const other of others) {
      // create or find DM conversation (two collaborators)
      let conv = await Conversations.findOne({
        isConversation: true,
        collaborators: { $all: [testUser._id, other._id] },
      });
      if (!conv) {
        conv = await Conversations.create({
          collaborators: [testUser._id, other._id],
          createdBy: testUser._id,
          organisation: other.organisation || undefined,
          isConversation: true,
          name: other.username || other.email || String(other._id).slice(0,6),
        });
        totalConvs++;
      }

      // create a handful of messages for this DM
      const msgs = [];
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const sender = i % 2 === 0 ? testUser._id : other._id;
        msgs.push({
          sender,
          content: `Imported DM message ${i+1} between ${testUser.username} and ${other.username || other._id}`,
          conversation: conv._id,
          organisation: conv.organisation || undefined,
          createdAt: new Date(now.getTime() - (6 - i) * 60000),
          updatedAt: new Date(now.getTime() - (6 - i) * 60000),
        });
      }

      await Message.insertMany(msgs);
      totalMsgs += msgs.length;

      // small delay to avoid overwhelming DB in very large imports
      await delay(50);
    }

    console.log('Total DM conversations created:', totalConvs);
    console.log('Total DM messages inserted:', totalMsgs);

    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Error populating DMs/messages:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
};

run();
