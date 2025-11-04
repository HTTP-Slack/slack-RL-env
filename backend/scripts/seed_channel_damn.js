#!/usr/bin/env node
import { MongoClient, ObjectId } from 'mongodb';

const MONGO = process.env.MONGO_URI || 'mongodb://admin:admin123@mongodb:27017/test?authSource=admin';
const ORG_ID = process.env.SEED_ORG_ID || '6909c7fa9ae7ebbe11a01414';
const TEST_USER_ID = process.env.SEED_TEST_USER_ID || '6909bfbc322876a6534e1383';

function sanitizeForEmail(name){
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)+/g, '');
}

(async function main(){
  const client = new MongoClient(MONGO, { useNewUrlParser: true });
  try{
    console.log('Connecting to Mongo...');
    await client.connect();
    const db = client.db('test');

    const orgId = new ObjectId(ORG_ID);
    const testUserId = new ObjectId(TEST_USER_ID);

    const synthUsers = await db.collection('users').find({ email: /synthetic_user_/ }).toArray();
    console.log('Found synthetic users:', synthUsers.length);

    const sampleCursor = db.collection('users').find({ email: { $not: /synthetic_user_/ }, username: { $exists: true } }).limit(200);
    const sampleNames = await sampleCursor.map(u => u.username).toArray();
    console.log('Sample names count:', sampleNames.length);

    if(synthUsers.length === 0){
      console.log('No synthetic users found - exiting');
      await client.close();
      process.exit(0);
    }

    const updatedSynthIds = [];
    for(const s of synthUsers){
      let newName = sampleNames.length > 0 ? sampleNames[Math.floor(Math.random()*sampleNames.length)] : ('User' + Math.floor(Math.random()*1000));
      if(await db.collection('users').findOne({ username: newName })){
        newName = newName + '_' + Math.floor(Math.random()*900 + 100);
      }
      const newEmail = sanitizeForEmail(newName) + '@example.test';
      await db.collection('users').updateOne({ _id: s._id }, { $set: { username: newName, email: newEmail, updatedAt: new Date() } });
      console.log('Renamed', s.email, '->', newName, '<' + newEmail + '>');
      updatedSynthIds.push(s._id);
    }

    let channel = await db.collection('channels').findOne({ organisation: orgId, name: { $regex: /^damn talks$/i } });
    if(!channel){
      const org = await db.collection('organisations').findOne({ _id: orgId });
      const otherCo = (org.coWorkers || []).filter(id => !id.equals(testUserId) && updatedSynthIds.findIndex(x => x.equals(id)) === -1);
      const extra = otherCo.slice(0,2);
      const collaborators = [ testUserId ].concat(updatedSynthIds).concat(extra);
      const res = await db.collection('channels').insertOne({ name: 'damn talks', collaborators: collaborators, title: 'Hot takes and random thoughts', description: 'A channel for unfiltered discussion (NSFW-ish)', section: null, organisation: orgId, hasNotOpen: [], isChannel: true, starred: [], createdAt: new Date(), updatedAt: new Date() });
      channel = await db.collection('channels').findOne({ _id: res.insertedId });
      console.log('Created channel damn talks with id', channel._id.toString());
    } else {
      const collaboratorsSet = new Set(channel.collaborators.map(c => c.toString()));
      let changed = false;
      for(const id of updatedSynthIds){ if(!collaboratorsSet.has(id.toString())){ channel.collaborators.push(id); changed = true; } }
      if(!collaboratorsSet.has(testUserId.toString())){ channel.collaborators.push(testUserId); changed = true; }
      if(changed){ await db.collection('channels').updateOne({ _id: channel._id }, { $set: { collaborators: channel.collaborators, updatedAt: new Date() } }); console.log('Updated channel collaborators'); }
      else { console.log('Channel already had synthetic users'); }
    }

    const samplesCursor = db.collection('messages').find({ content: { $exists: true, $ne: null } }).limit(1000);
    const samples = await samplesCursor.map(m => m.content).toArray();
    if(!samples || samples.length === 0){ samples.push('Damn, that was wild.'); samples.push('Who saw that coming?'); samples.push('Nice point.'); }

    const messagesToInsert = 30;
    const docs = [];
    const collabs = channel.collaborators;
    for(let i=0;i<messagesToInsert;i++){
      const sender = collabs[Math.floor(Math.random()*collabs.length)];
      let content = samples[Math.floor(Math.random()*samples.length)];
      if(Math.random() < 0.25){ content = '[DamnTalks] ' + content; }
      if(Math.random() < 0.3 && content.length < 180) { content = content + ' ?'; }
      const createdAt = new Date(Date.now() - Math.floor(Math.random()*1000*60*60*24*7));
      docs.push({ content: content, sender: sender, organisation: orgId, channel: channel._id, reactions: [], threadReplies: [], isSelf: false, createdAt: createdAt, updatedAt: new Date() });
    }
    if(docs.length>0){ const r = await db.collection('messages').insertMany(docs); await db.collection('channels').updateOne({ _id: channel._id }, { $set: { updatedAt: new Date() } }); console.log('Inserted', r.insertedCount, 'messages into channel', channel._id.toString()); }

    console.log('Done.');
    await client.close();
    process.exit(0);
  }catch(err){ console.error('Error:', err); try{ await client.close(); }catch(e){} process.exit(1); }
})();
