'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label='Ganti mode terang/gelap'
      className='flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors'
      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
    >
      <span
        className='relative inline-flex h-4 w-8 items-center rounded-full transition-colors'
        style={{ backgroundColor: isDark ? '#ffffff' : '#000000' }}
      >
        <span
          className='inline-block h-3 w-3 transform rounded-full transition-transform'
          style={{
            backgroundColor: isDark ? '#000000' : '#ffffff',
            transform: isDark ? 'translateX(16px)' : 'translateX(2px)',
          }}
        />
      </span>
      {isDark ? 'Dark mode' : 'Light mode'}
    </button>
  );
}
