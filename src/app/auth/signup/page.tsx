'use client';
import Logo from '@/components/Logo';
import { useTheme } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    if (loading) return;

    e.preventDefault();
    setLoading(true);

    const toastStyle = {
      background: theme === 'dark' ? '#18181b' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#18181b',
      border: `1px solid ${theme === 'dark' ? '#3f3f46' : '#e4e4e7'}`,
    };

    try {
      await axios.post('/api/auth/register', {
        email,
        password,
      });

      toast('Daftar Berhasil', {
        style: toastStyle,
      });
      // immediately signin the user
      const loginRes = await signIn('credentials', {
        email,
        password,
      });

      if (loginRes?.error) {
        router.replace('/');
      } else {
        router.replace('/auth/setup-profile');
      }
      // setEmail('');
      // setPassword('');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast(error.response?.data.error || 'Something went wrong', {
          style: toastStyle,
        });
      } else {
        toast('Network error please try again', {
          style: toastStyle,
        });
      }
    }
    setLoading(false);
  };

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
        onSubmit={handleSignup}
        className='w-full max-w-sm rounded-2xl border p-6'
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
      >
        <h1 className='mb-4 text-lg font-bold'>Daftar</h1>

        <label className='mb-1 block text-sm font-medium'>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type='email'
          required
          placeholder='andi@contoh.id'
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />

        <label className='mb-1 block text-sm font-medium'>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type='password'
          required
          placeholder='••••••••'
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />

        <button
          type='submit'
          className='w-full rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-60'
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
        >
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>

        <p className='mt-4 text-center text-xs' style={{ color: 'var(--text-secondary)' }}>
          Sudah punya akun?{' '}
          <Link href='/' className='font-semibold underline'>
            Masuk
          </Link>
        </p>
      </form>
    </main>
  );
}
