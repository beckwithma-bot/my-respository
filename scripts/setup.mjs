/**
 * One-time setup script. Run after filling in .env.local:
 *   node scripts/setup.mjs
 *
 * Creates:
 *  - Owner account  (owner@yourdomain.com / change before running)
 *  - 2 worker accounts
 *  - users/ docs with roles
 *  - workers/ docs
 *  - Sample inventory items
 *
 * Requires: npm install -D firebase-admin dotenv
 * And a service account key at scripts/serviceAccountKey.json
 * (Firebase Console → Project Settings → Service accounts → Generate new private key)
 */

import { readFileSync } from 'fs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const admin = require('firebase-admin')
const { config } = require('dotenv')

config({ path: '.env.local' })

// ---------- EDIT THESE BEFORE RUNNING ----------
const OWNER_EMAIL    = 'owner@yourbusiness.com'
const OWNER_PASSWORD = 'ChangeMe123!'

const WORKERS = [
  { name: 'Alex Rivera',   email: 'alex@yourbusiness.com',   phone: '555-0101', password: 'Worker123!' },
  { name: 'Jordan Smith',  email: 'jordan@yourbusiness.com', phone: '555-0102', password: 'Worker123!' },
]

const INVENTORY = [
  { name: 'All-Purpose Flour',  currentQuantity: 50,  unit: 'lbs',   reorderThreshold: 10, supplierLocation: "Costco" },
  { name: 'Granulated Sugar',   currentQuantity: 30,  unit: 'lbs',   reorderThreshold: 5,  supplierLocation: "Costco" },
  { name: 'Unsalted Butter',    currentQuantity: 20,  unit: 'lbs',   reorderThreshold: 5,  supplierLocation: "Restaurant Depot" },
  { name: 'Large Eggs',         currentQuantity: 10,  unit: 'dozen', reorderThreshold: 3,  supplierLocation: "Restaurant Depot" },
  { name: 'Heavy Cream',        currentQuantity: 8,   unit: 'qts',   reorderThreshold: 2,  supplierLocation: "Restaurant Depot" },
  { name: 'Baking Powder',      currentQuantity: 5,   unit: 'lbs',   reorderThreshold: 1,  supplierLocation: "Sysco" },
  { name: 'Vanilla Extract',    currentQuantity: 3,   unit: 'btls',  reorderThreshold: 1,  supplierLocation: "Sysco" },
  { name: 'Disposable Gloves',  currentQuantity: 4,   unit: 'boxes', reorderThreshold: 1,  supplierLocation: "Amazon" },
  { name: 'Parchment Paper',    currentQuantity: 2,   unit: 'rolls', reorderThreshold: 1,  supplierLocation: "Amazon" },
  { name: 'Cake Boxes (10in)',   currentQuantity: 25,  unit: 'units', reorderThreshold: 10, supplierLocation: "Uline" },
]
// -----------------------------------------------

let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync('scripts/serviceAccountKey.json', 'utf8'))
} catch {
  console.error('\n❌  scripts/serviceAccountKey.json not found.')
  console.error('   Download it from Firebase Console → Project Settings → Service accounts\n')
  process.exit(1)
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const auth = admin.auth()
const db   = admin.firestore()
const now  = admin.firestore.FieldValue.serverTimestamp()

async function run() {
  console.log('\n🚀 TaskFlow Setup\n')

  // --- Owner ---
  console.log('Creating owner account…')
  let ownerUid
  try {
    const existing = await auth.getUserByEmail(OWNER_EMAIL)
    ownerUid = existing.uid
    console.log(`  ↳ already exists (${ownerUid})`)
  } catch {
    const rec = await auth.createUser({ email: OWNER_EMAIL, password: OWNER_PASSWORD })
    ownerUid = rec.uid
    console.log(`  ↳ created (${ownerUid})`)
  }
  await db.doc(`users/${ownerUid}`).set({ role: 'owner', email: OWNER_EMAIL })

  // --- Workers ---
  for (const w of WORKERS) {
    console.log(`Creating worker: ${w.name}…`)
    let uid
    try {
      const existing = await auth.getUserByEmail(w.email)
      uid = existing.uid
      console.log(`  ↳ already exists (${uid})`)
    } catch {
      const rec = await auth.createUser({ email: w.email, password: w.password })
      uid = rec.uid
      console.log(`  ↳ created (${uid})`)
    }
    await db.doc(`users/${uid}`).set({ role: 'worker', workerId: uid, workerName: w.name, email: w.email })
    await db.doc(`workers/${uid}`).set({ name: w.name, phone: w.phone, fcmToken: null, taskIds: [] })
  }

  // --- Inventory ---
  console.log('\nSeeding inventory…')
  const batch = db.batch()
  for (const item of INVENTORY) {
    const ref = db.collection('inventory').doc()
    batch.set(ref, { ...item, lastUpdated: now })
    console.log(`  ↳ ${item.name}`)
  }
  await batch.commit()

  console.log('\n✅ Done! Credentials summary:')
  console.log(`\n  Owner:`)
  console.log(`    Email:    ${OWNER_EMAIL}`)
  console.log(`    Password: ${OWNER_PASSWORD}`)
  WORKERS.forEach(w => {
    console.log(`\n  Worker — ${w.name}:`)
    console.log(`    Email:    ${w.email}`)
    console.log(`    Password: ${w.password}`)
  })
  console.log('\n  ⚠️  Change all passwords after first login.\n')

  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
