'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaCog, FaBars, FaTimes, FaHome, FaFilm, FaBook, FaHeart, FaSearch, FaBell, FaCrown, FaChevronDown } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);
  
  // Fermer le menu utilisateur quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Focus l'input de recherche quand on ouvre la recherche
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: window.location.origin });
  };

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: window.location.origin });
  };
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header className={`shadow-lg backdrop-blur-md transition-all duration-300 ${scrolled ? 'bg-dark-color/95 shadow-xl' : 'bg-gradient-to-b from-dark-color/90 to-transparent'}`}>
      <div className="header-container max-w-7xl mx-auto">
        <div className="nav-container gap-6">
          <Link href="/" className="logo flex items-center">
            <span className="logo-primary text-3xl font-bold">Lo</span>
            <span className="text-3xl font-bold">kum</span>
            <div className="hidden sm:flex ml-1 items-center bg-primary/20 px-2 py-0.5 rounded-md">
              <span className="text-xs text-primary font-medium">BETA</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <FaHome className={isActive('/') ? 'text-primary' : ''} />
              <span>Accueil</span>
            </Link>
            <Link 
              href="/animes" 
              className={`nav-link ${isActive('/animes') ? 'active' : ''}`}
            >
              <FaFilm className={isActive('/animes') ? 'text-primary' : ''} />
              <span>Animés</span>
            </Link>
            <Link 
              href="/mangas" 
              className={`nav-link ${isActive('/mangas') ? 'active' : ''}`}
            >
              <FaBook className={isActive('/mangas') ? 'text-primary' : ''} />
              <span>Mangas</span>
            </Link>
            <Link 
              href="/favorites" 
              className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
            >
              <FaHeart className={isActive('/favorites') ? 'text-primary' : ''} />
              <span>Favoris</span>
            </Link>
          </nav>
        </div>

        <div className="header-actions">
          <div className={`search-container ${searchOpen ? 'search-open' : ''}`}>
            <button
              onClick={toggleSearch}
              className={`search-toggle md:hidden flex items-center justify-center h-10 w-10 rounded-full ${searchOpen ? 'bg-primary text-white' : 'bg-dark-light-color hover:bg-dark-card-color'}`}
              aria-label="Rechercher"
            >
              {searchOpen ? <FaTimes className="text-lg" /> : <FaSearch className="text-lg" />}
            </button>
            
            <div className={`search-bar ${searchOpen ? 'flex' : 'hidden md:flex'}`}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher des animés, mangas..."
                className="search-input"
              />
              <button className="search-button">
                <FaSearch />
              </button>
            </div>
          </div>

          <div className="user-actions">
            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-light-color transition duration-200"
                  aria-label="Menu utilisateur"
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-dark-light-color border border-gray-700 flex items-center justify-center">
                    {session.user.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'Profil'} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-primary" />
                    )}
                    
                    {isAdminUser && (
                      <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 text-[8px]">
                        <FaCrown />
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">{session.user.name || 'Profil'}</span>
                  <FaChevronDown className={`text-xs transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right bg-dark-card-color rounded-lg shadow-lg border border-gray-700 z-50 animate-fade-in">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-700 mb-1">
                        <p className="text-sm font-medium">{session.user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                      </div>
                      
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
                        <div className="flex items-center gap-2 px-4 py-2 hover:bg-dark-light-color">
                          <FaUser className="text-primary" />
                          <span>Mon profil</span>
                        </div>
                      </Link>
                      
                      {isAdminUser && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}>
                          <div className="flex items-center gap-2 px-4 py-2 hover:bg-dark-light-color">
                            <FaCog className="text-primary" />
                            <span>Administration</span>
                          </div>
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-700 mt-1 pt-1">
                        <button 
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-dark-light-color text-red-400"
                          onClick={() => {
                            handleSignOut();
                            setUserMenuOpen(false);
                          }}
                        >
                          <FaSignOutAlt />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={handleSignIn}
              >
                <FaSignInAlt />
                <span className="hidden sm:inline">Connexion</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'block' : 'hidden'} animate-fade-in`}>
        <div className="mobile-menu-container">
          <div className="mobile-search">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des animés, mangas..."
                className="w-full pl-10 pr-4 py-3 bg-dark-light-color rounded-md border border-gray-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          
          <nav className="mobile-nav">
            <Link 
              href="/" 
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <FaHome className={isActive('/') ? 'text-primary' : ''} />
              <span>Accueil</span>
            </Link>
            <Link 
              href="/animes" 
              className={`mobile-nav-link ${isActive('/animes') ? 'active' : ''}`}
            >
              <FaFilm className={isActive('/animes') ? 'text-primary' : ''} />
              <span>Animés</span>
            </Link>
            <Link 
              href="/mangas" 
              className={`mobile-nav-link ${isActive('/mangas') ? 'active' : ''}`}
            >
              <FaBook className={isActive('/mangas') ? 'text-primary' : ''} />
              <span>Mangas</span>
            </Link>
            <Link 
              href="/favorites" 
              className={`mobile-nav-link ${isActive('/favorites') ? 'active' : ''}`}
            >
              <FaHeart className={isActive('/favorites') ? 'text-primary' : ''} />
              <span>Favoris</span>
            </Link>
          </nav>
          
          <div className="mobile-user-actions">
            {session ? (
              <>
                <div className="flex items-center gap-3 p-3 mb-4 bg-dark-card-color rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-dark-light-color border border-gray-700 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'Profil'} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{session.user.name || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{session.user.email}</p>
                  </div>
                </div>
                
                {isAdminUser && (
                  <Link 
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="btn btn-outline btn-sm full-width mb-2">
                      <FaCog className="text-primary" />
                      <span>Administration</span>
                    </button>
                  </Link>
                )}
                
                <Link 
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button className="btn btn-outline btn-sm full-width mb-4">
                    <FaUser className="text-primary" />
                    <span>Mon profil</span>
                  </button>
                </Link>
                
                <button 
                  className="btn btn-primary btn-sm full-width"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <FaSignOutAlt />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <button 
                className="btn btn-primary btn-sm full-width"
                onClick={() => {
                  handleSignIn();
                  setMobileMenuOpen(false);
                }}
              >
                <FaSignInAlt />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 