import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lokum - Votre plateforme d\'animés en streaming',
  description: 'Découvrez et regardez vos animés et mangas préférés en streaming gratuitement',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <NextAuthProvider>
          <div className="app-container">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
