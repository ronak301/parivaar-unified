import type { Metadata } from 'next';
import { Manrope, Hanken_Grotesk, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ChakraUIProvider } from '@/components/ui-chakra/provider';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Parivaar Admin',
  description: 'Parivaar Community Management Admin Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${hankenGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ChakraUIProvider>{children}</ChakraUIProvider>
      </body>
    </html>
  );
}
