export { default } from 'next-auth/middleware';

// Halaman chat tidak bisa dibuka sama sekali tanpa login (fitur wajib #1).
// next-auth middleware otomatis redirect ke /login kalau belum ada session.
export const config = {
  matcher: ['/chat/:path*'],
};
