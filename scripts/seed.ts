// Skrip untuk membuat akun sampel supaya bisa langsung dites (syarat pengumpulan #2).
// Jalankan dengan: node scripts/seed.mjs
// Pastikan MONGODB_URI sudah diset di .env.local atau environment.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config({ path: '.env.local' });

// Sama seperti di lib/mongodb.js: paksa pakai DNS publik supaya query SRV
// tidak gagal gara-gara resolver router ISP.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // abaikan
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
  },
  { timestamps: true },
);

const sampleUsers: { name: string; email: string; password: string }[] = [
  { name: 'Andi Pratama', email: 'andi@contoh.id', password: 'password123' },
  { name: 'Maya Handayani', email: 'maya@contoh.id', password: 'password123' },
];

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI belum diset. Cek file .env.local');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  for (const u of sampleUsers) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Sudah ada: ${u.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({ name: u.name, email: u.email, passwordHash });
    console.log(`Berhasil dibuat: ${u.email} / ${u.password}`);
  }

  await mongoose.disconnect();
}

main();
