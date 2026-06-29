"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
if (ADMIN_EMAILS.length === 0) {
    console.error('❌ ADMIN_EMAILS is not set in your .env file. Aborting.');
    process.exit(1);
}
const User = mongoose_1.default.model('User', new mongoose_1.default.Schema({}, { strict: false }), 'users');
async function cleanup() {
    console.log('\n🔗 Connecting to MongoDB...');
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');
    const total = await User.countDocuments();
    const toDelete = await User.find({ email: { $nin: ADMIN_EMAILS } }).select('name email status').lean();
    console.log(`📊 Total accounts: ${total}`);
    console.log(`🛡  Keeping admin: ${ADMIN_EMAILS.join(', ')}`);
    console.log(`🗑  Will delete ${toDelete.length} accounts:\n`);
    toDelete.forEach((u) => console.log(`  • ${u.name} <${u.email}> [${u.status}]`));
    if (toDelete.length === 0) {
        console.log('Nothing to delete!');
        await mongoose_1.default.disconnect();
        return;
    }
    console.log('\n⚠️  Deleting in 3 seconds... Ctrl+C to abort.\n');
    await new Promise(r => setTimeout(r, 3000));
    const result = await User.deleteMany({ email: { $nin: ADMIN_EMAILS } });
    console.log(`✅ Deleted ${result.deletedCount} accounts.`);
    await mongoose_1.default.disconnect();
}
cleanup().catch(err => { console.error('❌', err.message); process.exit(1); });
//# sourceMappingURL=cleanup.js.map