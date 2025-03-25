import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FaHome } from 'react-icons/fa';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>
      
      <div className="prose prose-invert max-w-none">
        <p className="text-lg mb-4">
          Dernière mise à jour : {new Date().toLocaleDateString()}
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            Bienvenue sur StreamFlix. Nous nous engageons à protéger votre vie privée et vos données personnelles. 
            Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations 
            lorsque vous utilisez notre service de streaming.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Informations que nous collectons</h2>
          <p>Nous collectons les types d'informations suivants:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>Informations du compte</strong>: Lorsque vous créez un compte, nous collectons votre nom, adresse e-mail, et mot de passe.
            </li>
            <li>
              <strong>Informations d'utilisation</strong>: Nous collectons des données sur votre interaction avec notre service, comme les contenus visionnés, 
              les recherches effectuées, et vos préférences.
            </li>
            <li>
              <strong>Informations techniques</strong>: Nous recueillons des données techniques comme votre adresse IP, type d'appareil, 
              navigateur web, et système d'exploitation.
            </li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Comment nous utilisons vos informations</h2>
          <p>Nous utilisons vos informations pour:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Fournir, maintenir et améliorer notre service de streaming</li>
            <li>Personnaliser votre expérience et vous recommander des contenus pertinents</li>
            <li>Communiquer avec vous concernant votre compte, nos services, et nos mises à jour</li>
            <li>Détecter, prévenir et résoudre les problèmes techniques et de sécurité</li>
            <li>Se conformer aux obligations légales</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Partage de vos informations</h2>
          <p>
            Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager vos informations dans les situations suivantes:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Avec des prestataires de services qui nous aident à exploiter notre plateforme</li>
            <li>Pour respecter nos obligations légales</li>
            <li>Pour protéger nos droits, notre propriété, ou notre sécurité, ainsi que ceux de nos utilisateurs</li>
            <li>Dans le cadre d'une fusion, acquisition, ou vente d'actifs</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Conservation des données</h2>
          <p>
            Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter 
            nos obligations légales. Si vous supprimez votre compte, nous supprimons ou anonymisons vos informations, 
            sauf si nous sommes légalement tenus de les conserver.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Vos droits</h2>
          <p>Selon votre juridiction, vous pouvez avoir les droits suivants concernant vos données:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Accéder à vos données personnelles</li>
            <li>Rectifier des informations inexactes</li>
            <li>Supprimer vos données</li>
            <li>Restreindre ou vous opposer au traitement de vos données</li>
            <li>Obtenir une copie de vos données dans un format structuré</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, veuillez nous contacter via les coordonnées fournies dans cette politique.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Modifications de cette politique</h2>
          <p>
            Nous pouvons mettre à jour cette politique de confidentialité périodiquement. Nous vous informerons de tout changement 
            significatif par e-mail ou via une notification sur notre site web.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Nous contacter</h2>
          <p>
            Si vous avez des questions ou des préoccupations concernant cette politique de confidentialité, 
            veuillez nous contacter à: privacy@streamflix.example.com
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