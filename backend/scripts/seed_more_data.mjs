import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/test';

const run = async () => {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI, { autoIndex: false });
    console.log('Connected');

    const { default: User } = await import('../src/models/user.model.js');
    const { default: Channel } = await import('../src/models/channel.model.js');
    const { default: Conversations } = await import('../src/models/conversation.model.js');
    const { default: Message } = await import('../src/models/message.model.js');

    const testUser = await User.findOne({ email: 'test@hotmail.com' });
    if (!testUser) {
      console.error('Test user not found. Run create_test_user.mjs first.');
      process.exit(1);
    }

    const otherUsers = await User.find({ _id: { $ne: testUser._id } }).limit(200).lean();
    console.log('Other users available:', otherUsers.length);

    // 1) Create many channels
    const channelsToCreate = 100; // adjust as needed
    const channelDocs = [];
    for (let i = 1; i <= channelsToCreate; i++) {
      channelDocs.push({
        name: `bulk-channel-${i}`,
        collaborators: [testUser._id, ...(otherUsers.slice(0, Math.min(10, otherUsers.length)).map(u=>u._id))],
        title: `Bulk channel ${i}`,
        description: 'Automatically generated channel for testing',
        isChannel: true,
      });
    }
    const createdChannels = await Channel.insertMany(channelDocs);
    console.log('Created channels:', createdChannels.length);

    // 2) Create many DM conversations (pair test user with many other users)
    let dmCreated = 0;
    const dmTargets = otherUsers.slice(0, 100);
    const createdConvs = [];
    for (const other of dmTargets) {
      const existing = await Conversations.findOne({ isConversation: true, collaborators: { $all: [testUser._id, other._id] } });
      if (!existing) {
        const conv = await Conversations.create({
          collaborators: [testUser._id, other._id],
          createdBy: testUser._id,
          isConversation: true,
          name: other.username || other.email || String(other._id).slice(0,6),
        });
        createdConvs.push(conv);
        dmCreated++;
      }
    }
    console.log('DM conversations created:', dmCreated);

    // 3) Populate messages for channels and DMs
    let msgCount = 0;

    // Channel messages: for first 30 created channels, insert 20 messages each
    const channelSamples = createdChannels.slice(0, Math.min(30, createdChannels.length));
    for (const ch of channelSamples) {
      const msgs = [];
      const now = Date.now();
      for (let i = 0; i < 20; i++) {
        const sender = (i % 3 === 0 && otherUsers[i % otherUsers.length]) ? otherUsers[i % otherUsers.length]._id : testUser._id;
        msgs.push({
          sender,
          content: `Channel ${ch.name} message ${i+1}`,
          channel: ch._id,
          createdAt: new Date(now - (20 - i) * 60000),
          updatedAt: new Date(now - (20 - i) * 60000),
        });
      }
      await Message.insertMany(msgs);
      msgCount += msgs.length;
    }

    // DM messages: for each created DM conv, add 30 messages
    for (const conv of createdConvs) {
      const msgs = [];
      const now = Date.now();
      for (let i = 0; i < 30; i++) {
        const sender = i % 2 === 0 ? testUser._id : conv.collaborators.find(id => String(id) !== String(testUser._id));
        msgs.push({
          sender,
          content: `DM ${conv._id.toString().slice(-6)} message ${i+1}`,
          conversation: conv._id,
          createdAt: new Date(now - (30 - i) * 60000),
          updatedAt: new Date(now - (30 - i) * 60000),
        });
      }
      await Message.insertMany(msgs);
      msgCount += msgs.length;
    }

    console.log('Total messages inserted:', msgCount);

    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding more data:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
};

run();
