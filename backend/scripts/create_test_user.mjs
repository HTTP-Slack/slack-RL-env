import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/slack_clone_db';

const connect = async () => {
  console.log('Connecting to MongoDB...', MONGO_URI);
  await mongoose.connect(MONGO_URI, { autoIndex: false });
  console.log('Connected to MongoDB');
};

const run = async () => {
  try {
    await connect();

    const { default: User } = await import('../src/models/user.model.js');
    const { default: Channel } = await import('../src/models/channel.model.js');
    const { default: Conversations } = await import('../src/models/conversation.model.js');

    // NOTE: password must be >= 8 chars to satisfy User schema.
    const desired = {
      username: 'test123',
      email: 'test@hotmail.com',
      // upgraded to 8 chars so Mongoose validation & pre-save hooks work
      password: 'testest1',
      role: 'admin',
    };

    // Try to find by email first
    let user = await User.findOne({ email: desired.email });
    const insertDirectly = async (doc) => {
      // Hash the password and insert directly into the collection to bypass mongoose validators
      const hashed = await bcrypt.hash(doc.password, 10);
      const now = new Date();
      const raw = {
        username: doc.username,
        email: doc.email,
        password: hashed,
        role: doc.role,
        createdAt: now,
        updatedAt: now,
      };
      const res = await mongoose.connection.collection('users').insertOne(raw);
      return await User.findById(res.insertedId);
    };

    if (user) {
      console.log('Found existing user by email:', desired.email);
      // update password/username if needed; prefer using Mongoose save so hooks run when valid
      user.username = desired.username;
      user.password = desired.password;
      try {
        await user.save();
        console.log('Updated existing user (password reset)');
      } catch (e) {
        // Fallback: directly set hashed password in the raw collection
        console.warn('Could not update via Mongoose (validation). Falling back to direct update with hashed password.');
        const hashed = await bcrypt.hash(desired.password, 10);
        await mongoose.connection.collection('users').updateOne({ _id: user._id }, { $set: { password: hashed, username: desired.username, updatedAt: new Date() } });
        user = await User.findById(user._id);
      }
    } else {
      // if email not found, also check username collision
      user = await User.findOne({ username: desired.username });
      if (user) {
        console.log('Found existing user by username. Setting email and password.');
        user.email = desired.email;
        user.password = desired.password;
        try {
          await user.save();
        } catch (e) {
          console.warn('Could not update via Mongoose (validation). Falling back to direct update with hashed password.');
          const hashed = await bcrypt.hash(desired.password, 10);
          await mongoose.connection.collection('users').updateOne({ _id: user._id }, { $set: { password: hashed, email: desired.email, updatedAt: new Date() } });
          user = await User.findById(user._id);
        }
      } else {
        // Try create with mongoose first (to get hooks & validation). If validation fails (e.g., minlength), fallback to direct insert with hashed password.
        try {
          user = await User.create(desired);
          console.log('Created new test user:', user._id.toString());
        } catch (err) {
          console.warn('Mongoose create failed (likely validation). Falling back to direct insert.');
          user = await insertDirectly(desired);
          console.log('Inserted test user directly (bypassed mongoose validators):', user._id.toString());
        }
      }
    }

    const userId = user._id;

    // Add user to all channels (so they appear everywhere)
    const channelsResult = await Channel.updateMany(
      {},
      { $addToSet: { collaborators: userId } }
    );

    // Add user to all conversations
    const convResult = await Conversations.updateMany(
      {},
      { $addToSet: { collaborators: userId } }
    );

    // Create some DM conversations with a few existing users (if they don't already exist)
    const sampleUsers = await User.find({ _id: { $ne: userId } }).limit(10).lean();
    let createdDMs = 0;
    for (const other of sampleUsers) {
      const exists = await Conversations.findOne({
        collaborators: { $all: [userId, other._id] },
        isConversation: true,
      });
      if (!exists) {
        await Conversations.create({
          collaborators: [userId, other._id],
          createdBy: userId,
          organisation: other.organisation || undefined,
          isConversation: true,
          name: other.username || other.email || String(other._id).slice(0,6),
        });
        createdDMs++;
      }
    }

    console.log(`Channels modified (matchedCount/modifiedCount): ${channelsResult.matchedCount}/${channelsResult.modifiedCount}`);
    console.log(`Conversations modified (matchedCount/modifiedCount): ${convResult.matchedCount}/${convResult.modifiedCount}`);
    console.log(`Direct messages created: ${createdDMs}`);

    console.log('Test user id:', userId.toString());
    console.log('You can now log in on the frontend with:');
    console.log('  username: test123');
    console.log('  email: test@hotmail.com');
    console.log('  password: testest');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Error creating test user:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
};

run();
