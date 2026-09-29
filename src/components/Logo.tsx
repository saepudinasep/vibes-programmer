'use client';

import Image from 'next/image';
import { useTheme } from './ThemeProvider';

interface LogoProps {
  size?: 'md' | 'lg';
}

export default function Logo({ size = 'md' }: LogoProps) {
  const { theme } = useTheme();

  const logoSrc =
    theme === 'dark' ? '/assets/images/white-logo.png' : '/assets/images/dark-logo.png';

  const dimensions = size === 'lg' ? { width: 75, height: 75 } : { width: 75, height: 50 };

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
