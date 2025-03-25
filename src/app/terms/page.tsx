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
            En accédant à ou en utilisant StreamFlix, vous acceptez d'être lié par ces Conditions d'Utilisation. 
            Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
          <p>
            StreamFlix est un service de streaming qui permet aux utilisateurs de visionner des films et des séries TV 
            via Internet sur leurs appareils compatibles. Pour utiliser notre service, vous devez avoir accès à Internet 
            et disposer d'un appareil compatible.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Comptes utilisateurs</h2>
          <p>
            Pour utiliser certaines fonctionnalités de notre service, vous devez créer un compte. Vous êtes responsable 
            de maintenir la confidentialité de vos informations de compte et de toutes les activités qui se produisent sous votre compte.
          </p>
          <p className="mt-2">
            Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte. 
            Nous ne serons pas responsables des pertes résultant d'une utilisation non autorisée de votre compte.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Contenu du service</h2>
          <p>
            Notre service propose un large éventail de films et séries TV. La disponibilité du contenu peut varier 
            selon votre emplacement géographique et peut changer de temps à autre.
          </p>
          <p className="mt-2">
            La qualité du contenu que vous pouvez visionner dépend de plusieurs facteurs, notamment votre emplacement, 
            la bande passante disponible et la vitesse de votre connexion Internet.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Utilisation acceptable</h2>
          <p>
            Vous acceptez de ne pas:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Utiliser notre service pour des activités illégales ou non autorisées</li>
            <li>Partager votre compte ou mot de passe avec d'autres personnes</li>
            <li>Tenter de contourner les mesures de sécurité ou les protections techniques de notre service</li>
            <li>Utiliser notre service d'une manière qui pourrait endommager, désactiver, surcharger ou altérer nos systèmes</li>
            <li>Collecter ou extraire des données de notre service sans notre autorisation explicite</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Droits de propriété intellectuelle</h2>
          <p>
            Tout le contenu disponible sur notre service, y compris les films, les séries TV, les images, les textes, 
            les logiciels, et la conception, est protégé par des droits d'auteur, des marques de commerce et d'autres 
            lois sur la propriété intellectuelle.
          </p>
          <p className="mt-2">
            Vous acceptez de ne pas reproduire, distribuer, modifier, afficher publiquement, exécuter publiquement, 
            republier, télécharger, stocker ou transmettre tout contenu disponible sur notre service, sauf expressément 
            autorisé par nous.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Résiliation</h2>
          <p>
            Nous nous réservons le droit de suspendre ou de résilier votre accès à notre service, avec ou sans préavis, 
            pour toute raison, y compris, sans limitation, si nous soupçonnons raisonnablement que vous avez violé ces 
            Conditions d'Utilisation.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Limitation de responsabilité</h2>
          <p>
            Dans toute la mesure permise par la loi applicable, StreamFlix ne sera pas responsable des dommages indirects, 
            accessoires, spéciaux, consécutifs ou punitifs, ou de toute perte de profits ou de revenus, que ces dommages 
            soient le résultat d'un délit (y compris la négligence), d'une rupture de contrat ou autre, et que nous ayons 
            été informés ou non de la possibilité de tels dommages.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Modifications des conditions</h2>
          <p>
            Nous nous réservons le droit de modifier ces Conditions d'Utilisation à tout moment. Les modifications entrent 
            en vigueur dès leur publication sur notre site web. Il est de votre responsabilité de consulter régulièrement 
            ces Conditions d'Utilisation pour prendre connaissance des modifications.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Nous contacter</h2>
          <p>
            Si vous avez des questions concernant ces Conditions d'Utilisation, veuillez nous contacter à: 
            terms@streamflix.example.com
          </p>
        </section>
      </div>
      
      <div className="mt-12">
        <Link href="/">
          <Button className="flex items-center gap-2">
            <FaHome />
            <span>Retour à l'accueil</span>
          </Button>
        </Link>
      </div>
    </div>
  );
} 