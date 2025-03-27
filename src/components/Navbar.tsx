import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { FaSearch, FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome, FaFilm, FaTv, FaDragon, FaUserShield } from 'react-icons/fa';
import logo from '../assets/logo.svg';

const Navbar: React.FC = () => {
  const { currentUser, userData, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fermer le menu quand l'utilisateur navigue vers une autre page
  useEffect(() => {
    setIsMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Ajouter un effet de scroll pour changer l'apparence de la navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Implémentation future pour la recherche
      console.log(`Recherche pour: ${searchTerm}`);
      setSearchTerm('');
      setSearchOpen(false);
    }
  };

  // Style pour les liens de navigation actifs et inactifs
  const navLinkClasses = (isActive: boolean) => 
    `relative flex items-center px-3 py-2 transition-all duration-300 hover:text-red-500 font-medium ${
      isActive 
        ? 'text-red-500 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-500' 
        : 'text-white'
    }`;
  
  const isLinkActive = (path: string) => location.pathname === path;
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-900 bg-opacity-95 backdrop-blur-sm shadow-lg py-2' 
        : 'bg-gradient-to-b from-gray-900 to-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <img 
            src={logo} 
            alt="StreamFlix" 
            className="h-10 w-10 transition-transform duration-300 group-hover:rotate-12" 
          />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600 tracking-tight">
            StreamFlix
          </span>
        </Link>
        
        {/* Menu de navigation pour ordinateur */}
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={navLinkClasses(isLinkActive('/'))}>
            <FaHome className="mr-1" size={16} />
            Accueil
          </Link>
          <Link to="/movies" className={navLinkClasses(isLinkActive('/movies'))}>
            <FaFilm className="mr-1" size={16} />
            Films
          </Link>
          <Link to="/series" className={navLinkClasses(isLinkActive('/series'))}>
            <FaTv className="mr-1" size={16} />
            Séries
          </Link>
          <Link to="/animes" className={navLinkClasses(isLinkActive('/animes'))}>
            <FaDragon className="mr-1" size={16} />
            Animés
          </Link>
          
          {/* Liens pour utilisateurs authentifiés */}
          {currentUser && (
            <>
              <Link to="/profile" className={navLinkClasses(isLinkActive('/profile'))}>
                <FaUser className="mr-1" size={16} />
                Profil
              </Link>
              {/* Bouton Admin uniquement visible pour les admins */}
              {userData && userData.role === 'admin' && (
                <Link to="/admin" className={navLinkClasses(isLinkActive('/admin'))}>
                  <FaUserShield className="mr-1" size={16} />
                  Admin
                </Link>
              )}
            </>
          )}
        </div>
        
        {/* Actions (recherche, connexion) pour desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Bouton de recherche */}
          <div className="relative" ref={searchRef}>
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Rechercher"
            >
              <FaSearch size={18} />
            </button>
            
            {/* Barre de recherche */}
            {searchOpen && (
              <form 
                onSubmit={handleSearch}
                className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex items-center p-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-64 px-4 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-r-md"
                  >
                    <FaSearch size={18} />
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Bouton de connexion/déconnexion */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold mr-2">
                  {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-300 truncate max-w-[120px]">
                  {currentUser.email?.split('@')[0]}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors duration-300"
              >
                <FaSignOutAlt className="mr-1" />
                Sortir
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center"
            >
              <FaUser className="mr-1" size={14} />
              Connexion
            </Link>
          )}
        </div>
        
        {/* Bouton menu pour mobile */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Bouton de recherche mobile */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-white p-2 hover:text-red-500 transition-colors"
            aria-label="Rechercher"
          >
            <FaSearch size={18} />
          </button>
          
          {/* Bouton hamburger */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 hover:text-red-500 transition-colors"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>
      
      {/* Barre de recherche mobile */}
      {searchOpen && (
        <div 
          ref={searchRef}
          className="md:hidden p-4 bg-gray-800 shadow-md"
        >
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un film, une série..."
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-r-md"
            >
              <FaSearch size={18} />
            </button>
          </form>
        </div>
      )}
      
      {/* Menu mobile */}
      <div 
        ref={menuRef}
        className={`md:hidden fixed top-[60px] right-0 h-screen w-72 bg-gray-900 bg-opacity-95 backdrop-blur-sm transform transition-transform duration-300 ease-in-out shadow-xl z-50 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col px-4 py-6 space-y-3">
          {currentUser && (
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800 rounded-lg mb-4">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                {currentUser.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium truncate">
                  {currentUser.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
          
          <Link 
            to="/" 
            className={`flex items-center py-3 px-4 rounded-md ${
              isLinkActive('/') 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                : 'text-gray-200 hover:bg-gray-800'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaHome className="mr-3" size={18} />
            Accueil
          </Link>
          
          <Link 
            to="/movies" 
            className={`flex items-center py-3 px-4 rounded-md ${
              isLinkActive('/movies') 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                : 'text-gray-200 hover:bg-gray-800'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaFilm className="mr-3" size={18} />
            Films
          </Link>
          
          <Link 
            to="/series" 
            className={`flex items-center py-3 px-4 rounded-md ${
              isLinkActive('/series') 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                : 'text-gray-200 hover:bg-gray-800'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaTv className="mr-3" size={18} />
            Séries
          </Link>
          
          <Link 
            to="/animes" 
            className={`flex items-center py-3 px-4 rounded-md ${
              isLinkActive('/animes') 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                : 'text-gray-200 hover:bg-gray-800'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <FaDragon className="mr-3" size={18} />
            Animés
          </Link>
          
          {/* Liens pour utilisateurs authentifiés */}
          {currentUser && (
            <>
              <Link 
                to="/profile" 
                className={`flex items-center py-3 px-4 rounded-md ${
                  isLinkActive('/profile') 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                    : 'text-gray-200 hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUser className="mr-3" size={18} />
                Mon Profil
              </Link>
              
              {userData && userData.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`flex items-center py-3 px-4 rounded-md ${
                    isLinkActive('/admin') 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                      : 'text-gray-200 hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserShield className="mr-3" size={18} />
                  Admin
                </Link>
              )}
            </>
          )}
          
          {/* Liens de pied de page */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <Link 
              to="/contact" 
              className="block text-gray-400 hover:text-white py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/dmca" 
              className="block text-gray-400 hover:text-white py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              DMCA
            </Link>
            <Link 
              to="/cgu" 
              className="block text-gray-400 hover:text-white py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              CGU
            </Link>
            <Link 
              to="/privacy" 
              className="block text-gray-400 hover:text-white py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Confidentialité
            </Link>
          </div>
          
          {/* Bouton de connexion/déconnexion */}
          {currentUser ? (
            <button 
              onClick={handleSignOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md font-medium flex items-center justify-center mt-4"
            >
              <FaSignOutAlt className="mr-2" size={16} />
              Déconnexion
            </button>
          ) : (
            <Link 
              to="/login" 
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md font-medium flex items-center justify-center mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUser className="mr-2" size={16} />
              Connexion
            </Link>
          )}
        </div>
      </div>
      
      {/* Overlay pour fermer le menu mobile en cliquant en dehors */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar; 