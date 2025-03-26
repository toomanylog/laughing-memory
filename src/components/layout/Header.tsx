'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaCog, FaBars, FaTimes, FaHome, FaFilm, FaTv, FaHeart, FaSearch } from 'react-icons/fa';
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

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="header-container">
        <div className="nav-container">
          <Link href="/" className="logo">
            <span className="logo-primary">Lo</span>
            <span>kum</span>
          </Link>

          <nav>
            <Link 
              href="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <FaHome className={isActive('/') ? 'text-primary' : ''} />
              Accueil
            </Link>
            <Link 
              href="/animes" 
              className={`nav-link ${isActive('/animes') ? 'active' : ''}`}
            >
              <FaFilm className={isActive('/animes') ? 'text-primary' : ''} />
              Animés
            </Link>
            <Link 
              href="/mangas" 
              className={`nav-link ${isActive('/mangas') ? 'active' : ''}`}
            >
              <FaTv className={isActive('/mangas') ? 'text-primary' : ''} />
              Mangas
            </Link>
            <Link 
              href="/favorites" 
              className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
            >
              <FaHeart className={isActive('/favorites') ? 'text-primary' : ''} />
              Favoris
            </Link>
          </nav>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher des animés, mangas..."
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>

          <div className="user-actions">
            {session ? (
              <div className="flex gap-2">
                {/* Affiche toujours le bouton admin pour tester */}
                <Link href="/admin">
                  <button className="btn btn-sm btn-ghost">
                    <FaCog className="text-primary" />
                    Admin {isAdminUser ? '(Activé)' : '(Inactif)'}
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="btn btn-sm btn-ghost">
                    <FaUser className="text-primary" />
                    {session.user.name || 'Profil'}
                  </button>
                </Link>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => signOut()}
                >
                  <FaSignOutAlt />
                  Déconnexion
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => signIn()}
              >
                <FaSignInAlt />
                Connexion
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'block' : 'hidden'} animate-fade-in`}>
        <div className="mobile-menu-container">
          <div className="mobile-search">
            <input
              type="text"
              placeholder="Rechercher des animés, mangas..."
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
          
          <nav className="mobile-nav">
            <Link 
              href="/" 
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <FaHome className={isActive('/') ? 'text-primary' : ''} />
              Accueil
            </Link>
            <Link 
              href="/animes" 
              className={`mobile-nav-link ${isActive('/animes') ? 'active' : ''}`}
            >
              <FaFilm className={isActive('/animes') ? 'text-primary' : ''} />
              Animés
            </Link>
            <Link 
              href="/mangas" 
              className={`mobile-nav-link ${isActive('/mangas') ? 'active' : ''}`}
            >
              <FaTv className={isActive('/mangas') ? 'text-primary' : ''} />
              Mangas
            </Link>
            <Link 
              href="/favorites" 
              className={`mobile-nav-link ${isActive('/favorites') ? 'active' : ''}`}
            >
              <FaHeart className={isActive('/favorites') ? 'text-primary' : ''} />
              Favoris
            </Link>
          </nav>
          
          <div className="mobile-user-actions">
            {session ? (
              <>
                {/* Version mobile: aussi ajouter accès admin */}
                <Link 
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button className="btn btn-ghost btn-sm full-width">
                    <FaCog className="text-primary" />
                    Admin {isAdminUser ? '(Activé)' : '(Inactif)'}
                  </button>
                </Link>
                <Link 
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button className="btn btn-ghost btn-sm full-width">
                    <FaUser className="text-primary" />
                    {session.user.name || 'Profil'}
                  </button>
                </Link>
                <button 
                  className="btn btn-primary btn-sm full-width"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <FaSignOutAlt />
                  Déconnexion
                </button>
              </>
            ) : (
              <button 
                className="btn btn-primary btn-sm full-width"
                onClick={() => {
                  signIn();
                  setMobileMenuOpen(false);
                }}
              >
                <FaSignInAlt />
                Connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 