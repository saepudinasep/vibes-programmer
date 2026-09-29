import mongoose from 'mongoose';
import dns from 'dns';

declare global {
  var _mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

// Beberapa resolver DNS bawaan router ISP gagal menjawab query SRV ke Node.js
// (library c-ares) meskipun `nslookup` biasa berhasil. Memaksa Node memakai
// DNS publik (Google/Cloudflare) untuk resolve menghindari masalah ini.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Abaikan kalau environment tidak mengizinkan set DNS servers (mis. beberapa PaaS).
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI belum diset. Tambahkan di file .env.local atau environment variable hosting.',
  );
}

// Cache koneksi supaya tidak membuat koneksi baru setiap kali function serverless dipanggil.
const cached = global._mongooseCache ?? (global._mongooseCache = { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000, // gagal cepat (8 detik) daripada nge-hang lama saat DNS/network bermasalah
      })
      .then((mongooseInstance) => {
        console.log(
          '[mongodb] Berhasil konek ke Atlas, database:',
          mongooseInstance.connection.db?.databaseName,
        );
        return mongooseInstance;
      })
      .catch((err) => {
        // Reset promise supaya percobaan berikutnya tidak stuck di promise yang sudah gagal.
        cached.promise = null;
        console.error('[mongodb] Gagal konek ke Atlas:', err.name, '-', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
