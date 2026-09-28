'use client';

import Image from 'next/image';
import { useTheme } from './ThemeProvider';

export default function Logo({ size = 'md' }) {
  const { theme } = useTheme();

  const logoSrc =
    theme === 'dark' ? '/assets/images/white-logo.png' : '/assets/images/dark-logo.png';

  const dimensions = size === 'lg' ? { width: 180, height: 50 } : { width: 140, height: 40 };

  return (
    <Image
      src={logoSrc}
      alt='Akselera Tech'
      width={dimensions.width}
      height={dimensions.height}
      priority
      className='h-auto w-auto'
    />
  );
}
