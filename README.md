# Akselera.Tech - Chat Internal

Aplikasi chat 1-on-1 untuk technical task Vibes Programmer. Mendukung autentikasi, percakapan dan pesan tersimpan, light/dark mode, pencarian, penanda belum dibaca, status online, serta tampilan responsif.

## Stack dan Infrastruktur

| Bagian           | Teknologi                                                   | Alasan                                                                                           |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Framework dan UI | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 | Memenuhi framework wajib; halaman dan API berada dalam satu aplikasi.                            |
| Autentikasi      | NextAuth Credentials, JWT, bcryptjs                         | Login email/password dengan password yang di-hash; session tidak memerlukan collection terpisah. |
| Database         | MongoDB Atlas, Mongoose                                     | Atlas menyediakan database terkelola; Mongoose membantu validasi dan pemodelan dokumen.          |
| Hosting          | Vercel                                                      | Integrasi Next.js dan deployment dari GitHub.                                                    |
| Pembaruan pesan  | Polling 3 detik                                             | Menampilkan pesan baru tanpa layanan realtime tambahan.                                          |

## Menjalankan Lokal

1. Install dependency:

   ```bash
   npm install
   ```

2. Buat `.env.local` di root project. Isi dengan URI Atlas dan secret autentikasi sendiri:

   ```dotenv
   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority"
   NEXTAUTH_SECRET="<secret-random>"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   Pastikan cluster aktif, database user memiliki akses `readWrite`, dan IP diizinkan di Atlas Network Access. Jangan commit file environment atau membagikan connection string.

3. (Opsional) Buat dua akun demo di database yang sama:

   ```bash
   npx tsx scripts/seed.ts
   ```

   Akun: `andi@contoh.id` dan `maya@contoh.id`, keduanya memakai password `password123`. Ganti password demo sebelum memakai akun tersebut di deployment publik. Pendaftaran juga tersedia di `/register`.

4. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`. Pemeriksaan koneksi database tersedia di `/api/health`; validasi project dapat dijalankan dengan `npm run lint` dan `npm run build`.

## Deploy ke Vercel

Hubungkan repository GitHub ke Vercel, lalu tambahkan `MONGODB_URI`, `NEXTAUTH_SECRET`, dan `NEXTAUTH_URL` pada Environment Variables untuk Production. Gunakan URL deployment pada `NEXTAUTH_URL`, pastikan aturan Network Access Atlas mengizinkan koneksi Vercel, lalu deploy atau redeploy setelah mengubah environment variable.

## Struktur Tabel (Collection MongoDB)

### `users`

| Field                     | Tipe            | Keterangan                                                            |
| ------------------------- | --------------- | --------------------------------------------------------------------- |
| `_id`                     | ObjectId        | ID unik dokumen.                                                      |
| `name`                    | String          | Nama pengguna.                                                        |
| `email`                   | String (unique) | Email pengguna.                                                       |
| `passwordHash`            | String          | Hasil bcrypt, tidak pernah dikirim ke client.                         |
| `lastActiveAt`            | Date            | Di-update lewat heartbeat, dipakai untuk fitur status online (bonus). |
| `createdAt` / `updatedAt` | Date            | Dibuat otomatis oleh Mongoose (`timestamps`).                         |

### `conversations`

| Field                     | Tipe                            | Keterangan                                                                                    |
| ------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------- |
| `_id`                     | ObjectId                        | ID unik dokumen.                                                                              |
| `participants`            | [ObjectId]                      | Selalu berisi tepat 2 user ID (chat 1-on-1).                                                  |
| `lastMessage`             | `{ text, senderId, createdAt }` | Disimpan terdenormalisasi supaya daftar chat cepat ditampilkan tanpa query tambahan.          |
| `reads`                   | `[{ userId, lastReadAt }]`      | Kapan tiap user terakhir membaca conversation, dipakai untuk menghitung badge unread (bonus). |
| `createdAt` / `updatedAt` | Date                            | Dibuat otomatis oleh Mongoose (`timestamps`).                                                 |

### `messages`

| Field                     | Tipe     | Keterangan                                    |
| ------------------------- | -------- | --------------------------------------------- |
| `_id`                     | ObjectId | ID unik dokumen.                              |
| `conversationId`          | ObjectId | Referensi ke `conversations`.                 |
| `senderId`                | ObjectId | Referensi ke `users`.                         |
| `text`                    | String   | Isi pesan.                                    |
| `createdAt` / `updatedAt` | Date     | Dibuat otomatis oleh Mongoose (`timestamps`). |

## Keamanan dan Akses

- Middleware mengarahkan pengguna tanpa session dari `/chat` ke halaman login.
- API percakapan hanya mengembalikan data yang melibatkan pengguna aktif. API pesan memeriksa keanggotaan sebelum membaca atau mengirim pesan.
- Password disimpan sebagai hash bcrypt. Kredensial database hanya digunakan di server dan disimpan sebagai environment variable.

## AI Tools

- GitHub Copilot digunakan untuk membantu implementasi, debugging, dan dokumentasi. Perubahan ditinjau dan diverifikasi dengan lint/build.
- Claude (Anthropic) untuk scaffolding struktur proyek, penulisan API routes, dan komponen UI.

## Belum Selesai dan Batasan

- Fitur bonus pesan tanpa refresh tersedia melalui polling 3 detik, bukan koneksi push seperti WebSocket. Pesan baru dapat tampil dengan jeda hingga satu interval polling.
- Belum tersedia test otomatis (unit/integration); alur aplikasi perlu diverifikasi manual menggunakan dua akun.

## Catatan Lingkungan Lokal

Pada lingkungan pengembangan yang digunakan, DNS Node dapat gagal me-resolve URI Atlas `mongodb+srv://` dengan `querySrv ECONNREFUSED`. Jika terjadi, gunakan Standard Connection String Atlas (`mongodb://`) atau perbaiki resolver/firewall DNS lokal. Ini masalah resolusi DNS lokal, bukan fitur task atau aturan IP whitelist Atlas.
