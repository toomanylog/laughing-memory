'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import SearchBar from '@/components/SearchBar';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-black/80 backdrop-blur-md sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-bold text-white hover:text-primary transition-colors">
          StreamFlix
        </Link>

        <div className="hidden md:block mx-4 flex-grow max-w-md">
          <SearchBar />
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-white hover:text-primary transition-colors">
            Accueil
          </Link>
          <Link href="/movies" className="text-white hover:text-primary transition-colors">
            Films
          </Link>
          <Link href="/series" className="text-white hover:text-primary transition-colors">
            Séries
          </Link>
          <Link href="/favorites" className="text-white hover:text-primary transition-colors">
            Favoris
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          {session ? (
            <>
              {session.user.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-white">
                    <FaCog className="mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-white">
                  <FaUser className="mr-2" />
                  {session.user.name || 'Profil'}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white"
                onClick={() => signOut()}
              >
                <FaSignOutAlt className="mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white"
              onClick={() => signIn()}
            >
              <FaSignInAlt className="mr-2" />
              Connexion
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 shadow-lg py-4">
          <div className="container mx-auto px-4 space-y-4">
            <div className="mb-4">
              <SearchBar />
            </div>
            
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-white hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                href="/movies" 
                className="text-white hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Films
              </Link>
              <Link 
                href="/series" 
                className="text-white hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Séries
              </Link>
              <Link 
                href="/favorites" 
                className="text-white hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favoris
              </Link>
            </nav>
            
            <div className="pt-3 border-t border-gray-700 flex flex-col space-y-2">
              {session ? (
                <>
                  {session.user.isAdmin && (
                    <Link 
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" size="sm" className="text-white w-full justify-start">
                        <FaCog className="mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link 
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" size="sm" className="text-white w-full justify-start">
                      <FaUser className="mr-2" />
                      {session.user.name || 'Profil'}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white w-full justify-start"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FaSignOutAlt className="mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white w-full justify-start"
                  onClick={() => {
                    signIn();
                    setMobileMenuOpen(false);
                  }}
                >
                  <FaSignInAlt className="mr-2" />
                  Connexion
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 