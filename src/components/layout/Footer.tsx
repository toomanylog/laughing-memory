import Link from 'next/link';
import { FaGithub, FaHeart, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="logo mb-3">
              <span className="logo-primary">Lo</span>
              <span>kum</span>
            </Link>
            <p className="text-sm mb-3">Votre plateforme d'animés et mangas en streaming</p>
            <div className="flex gap-4 mb-6">
              <a href="#" className="footer-link" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="footer-link" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="footer-link" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="footer-title">Navigation</h3>
            <nav className="flex flex-col">
              <Link href="/" className="footer-link">
                Accueil
              </Link>
              <Link href="/animes" className="footer-link">
                Animés
              </Link>
              <Link href="/mangas" className="footer-link">
                Mangas
              </Link>
              <Link href="/favorites" className="footer-link">
                Favoris
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="footer-title">Légal</h3>
            <nav className="flex flex-col">
              <Link href="/privacy" className="footer-link">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="footer-link">
                Conditions d'utilisation
              </Link>
              <Link href="/contact" className="footer-link">
                Contact
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="footer-title">Communauté</h3>
            <p className="text-sm mb-3">
              Rejoignez notre communauté et restez informé des dernières nouveautés
            </p>
            <Link href="/register" className="btn btn-primary btn-sm">
              Inscrivez-vous
            </Link>
          </div>
        </div>
        
        <div className="footer-copyright">
          <p>© {currentYear} Lokum. Tous droits réservés.</p>
          <div className="flex justify-center gap-2 mt-2">
            <span>Fait avec</span>
            <FaHeart className="text-primary" />
            <span>par</span>
            <a 
              href="https://github.com/toomanylog" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <FaGithub />
              <span>toomanylog</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 