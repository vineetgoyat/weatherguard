import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

if (ADMIN_EMAILS.length === 0) {
  console.error('❌ ADMIN_EMAILS is not set in your .env file. Aborting.');
  process.exit(1);
}

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

async function cleanup() {
  console.log('\n🔗 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅ Connected\n');

  const total = await User.countDocuments();
  const toDelete = await User.find({ email: { $nin: ADMIN_EMAILS } }).select('name email status').lean();

  console.log(`📊 Total accounts: ${total}`);
  console.log(`🛡  Keeping admin: ${ADMIN_EMAILS.join(', ')}`);
  console.log(`🗑  Will delete ${toDelete.length} accounts:\n`);
  toDelete.forEach((u: any) => console.log(`  • ${u.name} <${u.email}> [${u.status}]`));

  if (toDelete.length === 0) {
    console.log('Nothing to delete!');
    await mongoose.disconnect();
    return;
  }

  console.log('\n⚠️  Deleting in 3 seconds... Ctrl+C to abort.\n');
  await new Promise(r => setTimeout(r, 3000));

  const result = await User.deleteMany({ email: { $nin: ADMIN_EMAILS } });
  console.log(`✅ Deleted ${result.deletedCount} accounts.`);
  await mongoose.disconnect();
}

cleanup().catch(err => { console.error('❌', err.message); process.exit(1); });
