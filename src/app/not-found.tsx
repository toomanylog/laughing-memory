import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FaHome, FaSearch } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold mb-6">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page non trouvée</h2>
      <p className="text-gray-400 max-w-md mb-8">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button className="flex items-center gap-2">
            <FaHome />
            <span>Retour à l'accueil</span>
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="flex items-center gap-2">
            <FaSearch />
            <span>Rechercher du contenu</span>
          </Button>
        </Link>
      </div>
    </div>
  );
} 