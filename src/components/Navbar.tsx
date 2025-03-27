import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const Navbar: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  
  return (
    <nav className="bg-black text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">Laughing Memory</Link>
        
        {/* Menu de navigation pour ordinateur */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-gray-300">Accueil</Link>
          <Link to="/movies" className="hover:text-gray-300">Films</Link>
          <Link to="/series" className="hover:text-gray-300">Séries</Link>
          
          {/* Liens pour utilisateurs authentifiés */}
          {currentUser && (
            <>
              <Link to="/profile" className="hover:text-gray-300">Mon Profil</Link>
              <Link to="/admin" className="hover:text-gray-300">Admin</Link>
            </>
          )}
          
          {/* Bouton de connexion/déconnexion */}
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">{currentUser.email}</span>
              <button 
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Connexion
            </Link>
          )}
        </div>
        
        {/* Bouton menu pour mobile */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>
      
      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link to="/" className="hover:text-gray-300 py-2">Accueil</Link>
            <Link to="/movies" className="hover:text-gray-300 py-2">Films</Link>
            <Link to="/series" className="hover:text-gray-300 py-2">Séries</Link>
            
            {/* Liens pour utilisateurs authentifiés */}
            {currentUser && (
              <>
                <Link to="/profile" className="hover:text-gray-300 py-2">Mon Profil</Link>
                <Link to="/admin" className="hover:text-gray-300 py-2">Admin</Link>
              </>
            )}
            
            {/* Bouton de connexion/déconnexion */}
            {currentUser ? (
              <div className="py-2">
                <div className="text-sm mb-2">{currentUser.email}</div>
                <button 
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm inline-block"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 