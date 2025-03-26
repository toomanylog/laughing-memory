import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    // Désactiver les avertissements ESLint pendant la construction
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TypeScript pendant la construction pour le déploiement
    ignoreBuildErrors: true,
  },
  // Configuration pour améliorer la compatibilité avec les composants qui utilisent useSession
  serverExternalPackages: ["next-auth"],
  
  // Forcer le rendu côté client pour toutes les pages
  output: 'export',
  
  // Remplacer le routage par défaut pour les pages exportées statiquement
  trailingSlash: true,
};

export default nextConfig;
