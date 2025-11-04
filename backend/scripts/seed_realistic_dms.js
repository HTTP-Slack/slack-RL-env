#!/usr/bin/env node
// Seed realistic DMs by sampling existing messages and users
import { MongoClient, ObjectId } from 'mongodb';

const MONGO = process.env.MONGO_URI || 'mongodb://admin:admin123@mongodb:27017/test?authSource=admin';
const ORG_ID = process.env.SEED_ORG_ID || '6909c7fa9ae7ebbe11a01414';
const TEST_USER_ID = process.env.SEED_TEST_USER_ID || '6909bfbc322876a6534e1383';

(async function main(){
  const client = new MongoClient(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  try{
    console.log('Connecting to Mongo...');
    await client.connect();
    const db = client.db('test');

    const orgId = new ObjectId(ORG_ID);
    const testUserId = new ObjectId(TEST_USER_ID);

    // sample messages contents
    const sampleCursor = db.collection('messages').find({ content: { $exists: true, $ne: null } }).limit(500);
    const samples = await sampleCursor.map(m => m.content).toArray();
    if(!samples || samples.length === 0){
      samples.push('Hey, just checking in.');
      samples.push('Sounds good to me.');
      samples.push('I will take a look and get back to you.');
    }
    console.log('Sample messages count:', samples.length);

    const org = await db.collection('organisations').findOne({ _id: orgId });
    if(!org){
      console.error('Organisation not found:', ORG_ID);
      process.exit(1);
    }

    const coWorkers = org.coWorkers || [];
    console.log('coWorkers count:', coWorkers.length);

    let totalInserted = 0;
    for(const uidRaw of coWorkers){
      const uid = typeof uidRaw === 'string' ? new ObjectId(uidRaw) : uidRaw;
      if(uid.equals(testUserId)) continue;

      // find existing conversation
      let convo = await db.collection('conversations').findOne({ organisation: orgId, isConversation: true, collaborators: { $all: [testUserId, uid] } });
      if(!convo){
        const otherUser = await db.collection('users').findOne({ _id: uid });
        const name = otherUser ? otherUser.username : 'Direct Message';
        const res = await db.collection('conversations').insertOne({
          name,
          collaborators: [testUserId, uid],
          organisation: orgId,
          createdBy: testUserId,
          isConversation: true,
          isSelf: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        convo = await db.collection('conversations').findOne({ _id: res.insertedId });
        console.log('Created conversation', convo._id.toString(), 'with', name);
      }

      // prepare 20 messages
      const docs = [];
      for(let m=0;m<20;m++){
        const sender = (m % 2 === 0) ? testUserId : uid;
        let content = samples[Math.floor(Math.random()*samples.length)];
        if(Math.random() < 0.3){
          content = content + (Math.random()<0.5 ? ' Thoughts?' : ' LMK');
        }
        const createdAt = new Date(Date.now() - Math.floor(Math.random()*1000*60*60*24*30));
        docs.push({
          content,
          sender,
          organisation: orgId,
          conversation: convo._id,
          reactions: [],
          threadReplies: [],
          isSelf: false,
          createdAt,
          updatedAt: new Date(),
        });
      }

      if(docs.length>0){
        const r = await db.collection('messages').insertMany(docs);
        totalInserted += r.insertedCount;
        await db.collection('conversations').updateOne({ _id: convo._id }, { $set: { updatedAt: new Date() } });
        console.log('Inserted', r.insertedCount, 'messages into convo', convo._id.toString());
      }
    }

    console.log('Total messages inserted:', totalInserted);
    await client.close();
    process.exit(0);
  }catch(err){
    console.error('Error seeding realistic dms:', err);
    try{ await client.close(); }catch(e){}
    process.exit(1);
  }
})();
