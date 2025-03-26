'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaCog, FaBars, FaTimes, FaHome, FaFilm, FaTv, FaHeart } from 'react-icons/fa';
import SearchBar from '@/components/SearchBar';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // Vérifier explicitement si l'utilisateur est admin
  useEffect(() => {
    if (session?.user) {
      console.log("Session user:", session.user);
      console.log("isAdmin status:", session.user.isAdmin);
      setIsAdminUser(!!session.user.isAdmin);
    }
  }, [session]);
  
  // Ajouter un effet de scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#151515] shadow-lg' : 'bg-gradient-to-b from-[#151515] to-transparent'
    }`}>
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold mr-8">
            <span className="text-primary">Stream</span>
            <span className="text-white">Flix</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <FaHome className={isActive('/') ? 'text-primary' : ''} />
                Accueil
              </span>
            </Link>
            <Link 
              href="/movies" 
              className={`nav-link ${isActive('/movies') ? 'active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <FaFilm className={isActive('/movies') ? 'text-primary' : ''} />
                Films
              </span>
            </Link>
            <Link 
              href="/series" 
              className={`nav-link ${isActive('/series') ? 'active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <FaTv className={isActive('/series') ? 'text-primary' : ''} />
                Séries
              </span>
            </Link>
            <Link 
              href="/favorites" 
              className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <FaHeart className={isActive('/favorites') ? 'text-primary' : ''} />
                Favoris
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>

          <div className="hidden md:flex items-center">
            {session ? (
              <div className="flex items-center gap-2">
                {/* Débug: Affiche toujours le bouton admin pour tester */}
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="rounded bg-[#222222] hover:bg-[#222222]/80">
                    <FaCog className="mr-2 text-[#E8B221]" />
                    Admin {isAdminUser ? '(Activé)' : '(Inactif)'}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="rounded bg-[#222222] hover:bg-[#222222]/80">
                    <FaUser className="mr-2 text-[#2173E8]" />
                    {session.user.name || 'Profil'}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded bg-primary hover:bg-primary/80"
                  onClick={() => signOut()}
                >
                  <FaSignOutAlt className="mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded bg-primary hover:bg-primary/80 text-white"
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
              className="rounded bg-[#222222] p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#222222] animate-fade-in">
          <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="mb-4">
              <SearchBar />
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`text-lg font-medium ${isActive('/') ? 'text-primary' : 'text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <FaHome className={isActive('/') ? 'text-primary' : ''} />
                  Accueil
                </span>
              </Link>
              <Link 
                href="/movies" 
                className={`text-lg font-medium ${isActive('/movies') ? 'text-primary' : 'text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <FaFilm className={isActive('/movies') ? 'text-primary' : ''} />
                  Films
                </span>
              </Link>
              <Link 
                href="/series" 
                className={`text-lg font-medium ${isActive('/series') ? 'text-primary' : 'text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <FaTv className={isActive('/series') ? 'text-primary' : ''} />
                  Séries
                </span>
              </Link>
              <Link 
                href="/favorites" 
                className={`text-lg font-medium ${isActive('/favorites') ? 'text-primary' : 'text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <FaHeart className={isActive('/favorites') ? 'text-primary' : ''} />
                  Favoris
                </span>
              </Link>
            </nav>
            
            <div className="pt-4 border-t border-gray-700 flex flex-col space-y-3">
              {session ? (
                <>
                  {/* Version mobile: aussi ajouter accès admin */}
                  <Link 
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="btn-outline w-full justify-start">
                      <FaCog className="mr-2 text-[#E8B221]" />
                      Admin {isAdminUser ? '(Activé)' : '(Inactif)'}
                    </Button>
                  </Link>
                  <Link 
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="btn-outline w-full justify-start">
                      <FaUser className="mr-2 text-[#2173E8]" />
                      {session.user.name || 'Profil'}
                    </Button>
                  </Link>
                  <Button 
                    className="btn-primary w-full justify-start"
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
                  className="btn-primary w-full justify-start"
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