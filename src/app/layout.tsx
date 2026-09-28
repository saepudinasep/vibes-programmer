import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: 'Akselera.Tech - Chat Internal',
  description: 'Aplikasi chat internal Akselera.Tech',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='id'>
      <body className={`${nunito.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
