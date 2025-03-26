import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-white hover:text-primary transition-colors">
              Lokum
            </Link>
            <p className="mt-2 text-sm">Votre plateforme d'animés en streaming</p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <nav className="flex flex-col space-y-2">
              <h3 className="text-white font-medium mb-1">Navigation</h3>
              <Link href="/" className="text-sm hover:text-white transition-colors">
                Accueil
              </Link>
              <Link href="/animes" className="text-sm hover:text-white transition-colors">
                Animés
              </Link>
              <Link href="/mangas" className="text-sm hover:text-white transition-colors">
                Mangas
              </Link>
            </nav>
            
            <nav className="flex flex-col space-y-2">
              <h3 className="text-white font-medium mb-1">Légal</h3>
              <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="text-sm hover:text-white transition-colors">
                Conditions d'utilisation
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-xs">
          <p>&copy; {currentYear} Lokum. Tous droits réservés.</p>
          <div className="mt-2 flex justify-center">
            <a 
              href="https://github.com/toomanylog" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <FaGithub className="mr-2" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 