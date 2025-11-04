import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/slack_clone_db';

const run = async () => {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI, { autoIndex: false });
    console.log('Connected');

    const { default: User } = await import('../src/models/user.model.js');
    const { default: Channel } = await import('../src/models/channel.model.js');

    const users = await User.find().select('_id').lean();
    const ids = users.map(u => u._id);

    const toCreate = [];
    for (let i = 1; i <= 10; i++) {
      toCreate.push({
        name: `dev-channel-${i}`,
        collaborators: ids,
        title: `Channel ${i}`,
        description: 'Created for test user visibility',
        isChannel: true,
      });
    }

    const inserted = await Channel.insertMany(toCreate);
    console.log('Inserted channels count:', inserted.length);

    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Error creating sample channels:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
};

run();
