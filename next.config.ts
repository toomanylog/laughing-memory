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
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.netlify.app"]
    },
  },
};

export default nextConfig;
