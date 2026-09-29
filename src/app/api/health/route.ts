import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '../../../../lib/mongodb';

// Endpoint diagnostik: buka http://localhost:3000/api/health (atau domain deploy-mu) di browser
// untuk melihat apakah server berhasil konek ke MongoDB Atlas, dan kalau gagal, pesan error persisnya.
// TIDAK mengekspos MONGODB_URI atau credential apa pun di response.
export async function GET() {
  const hasUri = Boolean(process.env.MONGODB_URI);

  if (!hasUri) {
    return NextResponse.json(
      {
        ok: false,
        step: 'env',
        message: 'MONGODB_URI tidak ditemukan di environment variable.',
        hint: 'Cek file .env.local (lokal) atau Environment Variables di Vercel Project Settings.',
      },
      { status: 500 },
    );
  }

  try {
    await connectDB();
    const state = mongoose.connection.readyState; // 1 = connected
    const dbName = mongoose.connection.db?.databaseName;

    return NextResponse.json({
      ok: state === 1,
      step: 'connect',
      readyState: state,
      database: dbName,
      message: state === 1 ? 'Berhasil konek ke MongoDB Atlas.' : 'Koneksi belum siap sepenuhnya.',
    });
  } catch (err: unknown) {
    // Log detail penuh ke server console (kelihatan di terminal `npm run dev`
    // atau di tab "Logs" project Vercel), tapi response ke client tetap aman (tidak bocorkan credential).
    console.error('[/api/health] Gagal konek ke MongoDB Atlas:', err);

    return NextResponse.json(
      {
        ok: false,
        step: 'connect',
        errorName: err instanceof Error ? err.name : 'UnknownError',
        message: err instanceof Error ? err.message : String(err),
        hint: hintFromError(err),
      },
      { status: 500 },
    );
  }
}

function hintFromError(err: unknown) {
  const error = err instanceof Error ? err : new Error(String(err));
  const msg = error.message;

  if (
    msg.includes('querySrv') ||
    msg.includes('ECONNREFUSED') ||
    (error.name === 'MongooseServerSelectionError' && msg.includes('SRV'))
  ) {
    return 'Gagal resolve DNS SRV. Cek koneksi internet, atau ganti ke Standard Connection String (non-SRV) dari Atlas.';
  }
  if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
    return 'Username/password database salah, atau password mengandung karakter spesial yang belum di-encode (encodeURIComponent).';
  }
  if (
    msg.includes('whitelist') ||
    msg.includes('IP') ||
    error.name === 'MongooseServerSelectionError'
  ) {
    return 'Kemungkinan IP kamu belum di-whitelist di Atlas Network Access, atau cluster sedang paused/tidak aktif.';
  }
  if (msg.includes('ENOTFOUND')) {
    return 'Hostname cluster tidak ditemukan. Cek kembali MONGODB_URI, mungkin ada typo pada nama cluster.';
  }
  return 'Cek MONGODB_URI, Network Access (IP whitelist), dan status cluster di dashboard Atlas.';
}
