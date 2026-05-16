import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  console.log("Fetching members of 'arteara'...");
  const snapshot = await db.collection('community_members')
    .where('communityId', '==', 'arteara')
    .get();

  console.log(`Found ${snapshot.size} members.`);
  
  const realUserNames = ['Romén', 'Abián', 'Monzón', 'Romen']; // Just in case of accents

  const batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    const uid = doc.id;
    const profileSnap = await db.collection('profiles').doc(uid).get();
    const profile = profileSnap.data();
    
    let isDemo = true;
    if (profile && profile.nombre) {
      if (realUserNames.some(name => profile.nombre.includes(name))) {
        isDemo = false;
      }
    } else {
        // Fetch from users just in case
        const userSnap = await db.collection('users').doc(uid).get();
        const userData = userSnap.data();
        if (userData && userData.nombre && realUserNames.some(name => userData.nombre.includes(name))) {
            isDemo = false;
        }
    }

    if (isDemo) {
      console.log(`Hiding demo user: ${profile?.nombre || uid}`);
      batch.update(db.collection('fichas').doc(uid), { 'datosOnboarding.communityId': 'arteara_hidden' });
      batch.update(db.collection('profiles').doc(uid), { 'datosOnboarding.communityId': 'arteara_hidden' });
      batch.update(db.collection('community_members').doc(uid), { communityId: 'arteara_hidden' });
      count++;
    } else {
      console.log(`Keeping real user: ${profile?.nombre || uid}`);
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully hid ${count} demo users.`);
  } else {
    console.log("No demo users found to hide.");
  }
}

run().catch(console.error);
