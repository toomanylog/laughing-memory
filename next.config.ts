import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    // Désactiver les avertissements ESLint pendant la construction
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
