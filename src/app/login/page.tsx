'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Email atau password salah');
      return;
    }
    router.push('/chat');
    router.refresh();
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
        <h1 className='mb-4 text-lg font-bold'>Masuk</h1>

        <label className='mb-1 block text-sm font-medium'>Email</label>
        <input
          type='email'
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='andi@contoh.id'
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />

        <label className='mb-1 block text-sm font-medium'>Password</label>
        <input
          type='password'
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='••••••••'
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
          className='w-full rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-60'
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>

        <p className='mt-4 text-center text-xs' style={{ color: 'var(--text-secondary)' }}>
          Belum punya akun?{' '}
          <Link href='/register' className='font-semibold underline'>
            Daftar
          </Link>
        </p>
      </form>
    </main>
  );
}
