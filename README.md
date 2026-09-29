# Akselera.Tech - Aplikasi Chat Internal

Technical Task Vibes Programmer - Akselera.Tech

## Stack & Infrastruktur

| Bagian      | Pilihan                                     | Alasan                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework   | Next.js 14 (App Router)                     | Sesuai ketentuan wajib. Frontend + API routes jadi satu proyek, cocok untuk timeline 3 hari.                                                                                                                                                                                                                                                                                               |
| Database    | MongoDB Atlas (free M0 cluster)             | Free tier cukup untuk beban ringan task ini, schema fleksibel untuk chat (pesan tidak butuh relasi rigid seperti SQL), dan mudah discale nanti saat integrasi WhatsApp API sungguhan.                                                                                                                                                                                                      |
| ODM         | Mongoose                                    | Memudahkan schema validation dan query di atas MongoDB tanpa boilerplate driver native.                                                                                                                                                                                                                                                                                                    |
| Autentikasi | NextAuth.js (Credentials Provider) + bcrypt | Session berbasis JWT (tidak perlu tabel session terpisah di DB), password di-hash dengan bcrypt, dan `middleware.ts` memastikan halaman `/chat` benar-benar tidak bisa diakses tanpa login (bukan cuma redirect di client).                                                                                                                                                                |
| Styling     | Tailwind CSS                                | Cepat untuk implementasi dua mode (light/dark) lewat CSS variable + class `dark`, dan mempermudah membuat tampilan responsif (bonus mobile-friendly).                                                                                                                                                                                                                                      |
| Hosting     | Vercel (free tier)                          | Native untuk Next.js, auto-deploy dari GitHub, cukup untuk kebutuhan free tier task ini.                                                                                                                                                                                                                                                                                                   |
| "Realtime"  | Polling tiap 3 detik (client-side interval) | Free tier Atlas M0 tidak mendukung Change Streams, dan menambah layanan realtime pihak ketiga (Pusher/Ably) berarti kredensial tambahan yang harus dijaga aman. Polling ringan ini memenuhi bonus "pesan masuk muncul tanpa refresh" dengan kompleksitas dan risiko paling rendah. Kalau perlu true realtime nanti, tinggal ganti ke Atlas dedicated cluster (Change Streams) atau Pusher. |

## Menjalankan Secara Lokal

1. Clone repo, lalu install dependency:
   ```bash
   npm install
   ```
2. Buat cluster gratis di [MongoDB Atlas](https://cloud.mongodb.com) (tier M0), buat database user, dan whitelist IP `0.0.0.0/0` (atau IP lokal) di Network Access.
3. Copy `.env.example` menjadi `.env.local`, lalu isi:
   ```
   MONGODB_URI=...
   NEXTAUTH_SECRET=... (generate dengan `openssl rand -base64 32`)
   NEXTAUTH_URL=http://localhost:3000
   ```
4. (Opsional) Buat 2 akun sampel otomatis:
   ```bash
   npm run seed
   ```
   Ini membuat akun `andi@contoh.id` dan `maya@contoh.id` dengan password `password123`.
   Atau bisa juga daftar manual lewat halaman `/register`.
5. Jalankan development server:
   ```bash
   npm run dev
   ```
6. Buka `http://localhost:3000`.

### Deploy ke Vercel

1. Push repo ke GitHub.
2. Import project di [vercel.com](https://vercel.com), hubungkan ke repo.
3. Tambahkan environment variable yang sama seperti `.env.local` di Vercel Project Settings (`MONGODB_URI`, `NEXTAUTH_SECRET`, dan `NEXTAUTH_URL` diisi domain Vercel, misal `https://nama-app.vercel.app`).
4. Deploy. Jalankan `npm run seed` secara lokal (mengarah ke database Atlas yang sama) untuk membuat akun sampel di production, atau daftar manual lewat `/register`.

## Troubleshooting: Error DNS saat Konek ke Atlas

Kalau muncul error seperti `querySrv ECONNREFUSED _mongodb._tcp....mongodb.net` saat `npm run dev` atau `npm run seed`, ini bukan salah kode — Node.js (lewat library `c-ares`) kadang gagal resolve DNS tipe SRV lewat resolver router ISP tertentu, meskipun `nslookup` biasa berhasil. Kode di `lib/mongodb.ts` dan `scripts/seed.ts` sudah memaksa Node memakai DNS publik (`8.8.8.8`, `1.1.1.1`) untuk menghindari ini. Kalau masih gagal juga, ambil "Standard Connection String" (non-SRV) dari Atlas: Database > Connect > Drivers > ubah dropdown versi driver ke yang lebih lama.

## Cek Koneksi Database: /api/health

Kalau muncul "Internal Server Error" di halaman manapun, buka endpoint ini di browser untuk tahu penyebab pastinya:

```
http://localhost:3000/api/health
```

(atau `https://domain-kamu.vercel.app/api/health` kalau sudah deploy)

Endpoint ini mengembalikan JSON `{ ok: true/false, message, hint }` — kalau `ok: false`, field `hint` langsung mengarahkan ke penyebab paling mungkin (DNS, auth salah, IP belum di-whitelist, dsb). Detail error lengkap juga tercetak di terminal `npm run dev` (lokal) atau tab **Logs** di dashboard Vercel (production).

## Checklist Konfigurasi Atlas yang Sering Jadi Penyebab Error

Urutan paling sering menyebabkan "Internal Server Error" / gagal konek:

1. **Network Access belum di-whitelist.** Di Atlas: Security > Network Access > pastikan ada entry `0.0.0.0/0` (allow semua IP) untuk kebutuhan task ini, atau IP publik kamu saat ini. Kalau baru ditambahkan, tunggu ~1 menit sampai statusnya "Active".
2. **Cluster sedang paused.** Free tier M0 tidak auto-pause, tapi kalau pernah di-pause manual, database user tidak akan bisa konek. Cek di halaman Database > pastikan status cluster bukan "Paused".
3. **Password mengandung karakter spesial.** Kalau password Atlas kamu berisi `@ # $ % & : /` dll, itu harus di-encode dengan `encodeURIComponent()` sebelum dimasukkan ke `MONGODB_URI`, kalau tidak koneksi akan gagal parse. Solusi termudah: generate ulang password lewat tombol "Autogenerate Secure Password" di Atlas (biasanya alfanumerik saja, aman dipakai langsung).
4. **Nama database tidak konsisten.** Pastikan bagian setelah `.net/` di `MONGODB_URI` (nama database, mis. `akselera-chat`) sama dengan yang kamu maksud — kalau kosong, Mongoose akan pakai database default `test`.
5. **Environment variable belum ke-load ulang.** Setelah mengubah `.env.local`, **restart** `npm run dev` (perubahan `.env` tidak ter-detect otomatis oleh Next.js). Di Vercel, setelah mengubah Environment Variables, lakukan **Redeploy**.
6. **User database tidak punya izin yang cukup.** Di Atlas: Security > Database Access > pastikan user-nya diberi role `readWrite` ke database yang dipakai (atau `Atlas admin` untuk kemudahan saat development).

## Struktur Tabel (Collection MongoDB)

**users**
| Field | Tipe | Keterangan |
|---|---|---|
| \_id | ObjectId | |
| name | String | |
| email | String (unique) | |
| passwordHash | String | hasil bcrypt, tidak pernah dikirim ke client |
| lastActiveAt | Date | di-update lewat heartbeat, dipakai untuk fitur status online (bonus) |
| createdAt / updatedAt | Date | otomatis (timestamps) |

**conversations**
| Field | Tipe | Keterangan |
|---|---|---|
| \_id | ObjectId | |
| participants | [ObjectId] | selalu berisi tepat 2 user id (chat 1-on-1) |
| lastMessage | { text, senderId, createdAt } | disimpan ter-denormalisasi supaya daftar chat cepat ditampilkan tanpa query tambahan |
| reads | [{ userId, lastReadAt }] | kapan tiap user terakhir baca conversation ini, dipakai untuk hitung badge unread (bonus) |
| createdAt / updatedAt | Date | |

**messages**
| Field | Tipe | Keterangan |
|---|---|---|
| \_id | ObjectId | |
| conversationId | ObjectId | referensi ke conversations |
| senderId | ObjectId | referensi ke users |
| text | String | |
| createdAt / updatedAt | Date | |

## Keamanan Akses Data (fitur wajib #5)

Isolasi data ditegakkan di **server**, bukan disaring di UI:

- `GET /api/conversations` hanya query `Conversation.find({ participants: session.user.id })` — user tidak pernah bisa melihat percakapan yang dia bukan participant-nya, bahkan lewat panggilan API langsung.
- `GET/POST /api/conversations/[id]/messages` memvalidasi ulang bahwa `session.user.id` ada di `participants` conversation tersebut sebelum mengembalikan atau menyimpan pesan apa pun. Kalau bukan participant, API sengaja mengembalikan `404` (bukan `403`) supaya tidak membocorkan keberadaan ID conversation orang lain.
- Semua route di atas mewajibkan session valid (`getServerSession`) — tanpa session, request langsung ditolak `401`.
- `middleware.ts` memblokir akses ke `/chat/*` di level routing sebelum halaman sempat dirender jika belum login.
- Password di-hash dengan bcrypt (`passwordHash`), tidak pernah disimpan atau dikirim dalam bentuk plain text.

## Penanganan Secret

- `.env.local` (berisi `MONGODB_URI`, `NEXTAUTH_SECRET`) di-ignore lewat `.gitignore`, tidak pernah masuk repo.
- Semua akses database terjadi di server (API routes / server components) — connection string tidak pernah dikirim ke bundle yang berjalan di browser.
- Di Vercel, secret disimpan sebagai Environment Variables, bukan hardcode di kode.

## AI Tools yang Dipakai

Proyek ini dibuat dengan bantuan Claude (Anthropic) untuk scaffolding struktur proyek, penulisan API routes, dan komponen UI, berdasarkan spesifikasi di dokumen technical task. Semua kode telah ditinjau dan dipahami penulis.

## Fitur Bonus yang Diimplementasikan

- [x] Pesan masuk muncul tanpa refresh (polling 3 detik)
- [x] Registrasi akun mandiri (`/register`)
- [x] Preferensi light/dark mode tersimpan di `localStorage`
- [x] Pencarian chat berdasarkan nama
- [x] Tampilan responsif untuk layar ponsel (di layar kecil, daftar chat dan isi percakapan tampil bergantian dengan tombol kembali, bukan berdampingan)
- [x] Penanda pesan belum dibaca (badge jumlah pesan yang belum dibaca per chat, hilang otomatis saat chat dibuka)
- [x] Status online (heartbeat tiap 15 detik dari client; dianggap online kalau aktif dalam 30 detik terakhir)

## Catatan Implementasi Fitur Bonus

- **Unread count**: dihitung di `GET /api/conversations` dengan membandingkan `createdAt` pesan terhadap `lastReadAt` milik user yang login, disimpan per-conversation di field `reads` pada dokumen `Conversation`. Endpoint `POST /api/conversations/[id]/read` dipanggil otomatis dari client saat sebuah chat dibuka.
- **Status online**: field `lastActiveAt` di `User` di-update lewat heartbeat `POST /api/presence` setiap 15 detik selagi aplikasi terbuka. User dianggap online kalau `lastActiveAt` kurang dari 30 detik yang lalu. Pendekatan heartbeat dipilih (bukan WebSocket) karena konsisten dengan pendekatan polling yang sudah dipakai untuk realtime pesan, dan tidak butuh infrastruktur tambahan.

## Yang Belum Selesai / Keterbatasan

- Logo pada `components/Logo.js` masih placeholder berbasis teks/SVG sederhana — silakan ganti dengan file logo asli dari folder **File Asset** (taruh di `/public`, lalu render `<img src="/logo-black.svg">` atau `<img src="/logo-white.svg">` sesuai tema).
- Realtime pesan dan status online sama-sama memakai polling/heartbeat, bukan push-based (WebSocket/SSE) — cukup untuk skala task ini, lihat tabel Stack di atas untuk alasannya.
- Belum ada test otomatis (unit/integration) karena keterbatasan waktu 3 hari; validasi dilakukan manual dengan 2 akun sampel.
