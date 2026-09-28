import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

export default function Home() {
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
        className='w-full max-w-sm rounded-2xl border p-6'
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
      >
        <h1 className='mb-4 text-lg font-bold'>Daftar</h1>

        <label className='mb-1 block text-sm font-medium'>Email</label>
        <input
          type='email'
          required
          placeholder='andi@contoh.id'
          className='mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
          style={{ borderColor: 'var(--border)' }}
        />

        <label className='mb-1 block text-sm font-medium'>Password</label>
        <input
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
          Daftar
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
