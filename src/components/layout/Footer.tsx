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
              StreamFlix
            </Link>
            <p className="mt-2 text-sm">Votre plateforme de streaming gratuite</p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <nav className="flex flex-col space-y-2">
              <h3 className="text-white font-medium mb-1">Navigation</h3>
              <Link href="/" className="text-sm hover:text-white transition-colors">
                Accueil
              </Link>
              <Link href="/movies" className="text-sm hover:text-white transition-colors">
                Films
              </Link>
              <Link href="/series" className="text-sm hover:text-white transition-colors">
                Séries
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
        
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© {currentYear} StreamFlix. Tous droits réservés.</p>
          <div className="mt-4 md:mt-0 flex items-center">
            <a 
              href="https://github.com/toomanylog/laughing-memory" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 