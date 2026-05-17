import { Cairo, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Providers from '@/providers/providers';
import { Metadata } from 'next';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'لوحة التحكم - علي فاضل',
  description: 'لوحة تحكم منصة المخرج علي فاضل',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={cairo.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
