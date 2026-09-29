'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Gagal mendaftar');
      return;
    }

    router.push('/login');
  }

  return (
    <main
      className='flex min-h-screen flex-col items-center justify-center gap-8 px-4'
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className='absolute right-4 top-4'>
        <ThemeToggle />
      </div>

      <Logo size='lg' />

      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm rounded-2xl border p-6'
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
      >
        <h1 className='mb-4 text-lg font-bold'>Buat akun</h1>

        <label className='mb-1 block text-sm font-medium'>Nama</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />

        <label className='mb-1 block text-sm font-medium'>Email</label>
        <input
          type='email'
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />

        <label className='mb-1 block text-sm font-medium'>Password</label>
        <input
          type='password'
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />

        {error && (
          <p
            className='mb-3 rounded-lg border px-3 py-2 text-xs'
            style={{ borderColor: '#e0c34a', backgroundColor: '#fdf6df', color: '#7a5b00' }}
          >
            {error}
          </p>
        )}

        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-lg py-2 text-sm font-semibold disabled:opacity-60'
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </button>

        <p className='mt-4 text-center text-xs' style={{ color: 'var(--text-secondary)' }}>
          Sudah punya akun?{' '}
          <Link href='/login' className='font-semibold underline'>
            Masuk
          </Link>
        </p>
      </form>
    </main>
  );
}
