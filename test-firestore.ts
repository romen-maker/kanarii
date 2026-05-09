import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

const configPath = "firebase-applet-config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = collection(db, "actas");
  const snap = await getDocs(q);
  console.log("Actas:", snap.size);
  snap.forEach(doc => {
    console.log(doc.id);
    console.log(doc.data());
  });
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
