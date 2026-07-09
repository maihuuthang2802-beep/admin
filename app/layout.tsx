import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'LocalBrand Admin' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
