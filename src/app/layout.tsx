import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { NextAuthProvider } from '@/providers/NextAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lokum - La Plateforme de Streaming Anime',
  description: 'Découvrez des centaines d\'animés et mangas en streaming HD',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="app-container">
          <NextAuthProvider>
            <Header />
            <main>
              {children}
            </main>
            <Footer />
          </NextAuthProvider>
        </div>
      </body>
    </html>
  );
}
