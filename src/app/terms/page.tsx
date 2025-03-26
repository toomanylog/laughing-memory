import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FaHome } from 'react-icons/fa';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Conditions d'utilisation</h1>
      
      <div className="prose prose-invert max-w-none">
        <p className="text-lg mb-4">
          Dernière mise à jour : {new Date().toLocaleDateString()}
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
          <p>
            En accédant à ou en utilisant Lokum, vous acceptez d'être lié par ces Conditions d'Utilisation. 
            Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
          <p>
            Lokum est un service de streaming qui permet aux utilisateurs de visionner des animés et des mangas 
            via Internet sur leurs appareils compatibles. Pour utiliser notre service, vous devez avoir accès à Internet 
            et disposer d'un appareil compatible.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Contenu</h2>
          <p>
            Le contenu proposé sur Lokum, y compris les animés, les mangas, les images et autres matériels, est 
            fourni uniquement à des fins de divertissement. L'accès à certains contenus peut être soumis à des 
            restrictions d'âge.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Comptes utilisateurs</h2>
          <p>
            Pour accéder à certaines fonctionnalités de Lokum, vous devrez créer un compte. Vous êtes responsable 
            de maintenir la confidentialité de vos informations de compte et de toutes les activités qui se produisent 
            sous votre compte.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Propriété intellectuelle</h2>
          <p>
            Tout le contenu présent sur Lokum est protégé par des droits d'auteur, des marques commerciales 
            et d'autres lois sur la propriété intellectuelle. Vous vous engagez à ne pas reproduire, distribuer, 
            modifier ou créer des œuvres dérivées à partir de ce contenu.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Modifications des conditions</h2>
          <p>
            Lokum se réserve le droit de modifier ces Conditions d'Utilisation à tout moment. Les modifications 
            prendront effet dès leur publication sur le site. Il est de votre responsabilité de consulter 
            régulièrement ces conditions.
          </p>
        </section>
        
        <div className="mt-12 flex justify-center">
          <Link href="/">
            <Button className="flex items-center">
              <FaHome className="mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 