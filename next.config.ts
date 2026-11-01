import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/projetos/instalcao-vilmar',
        destination: '/projetos/instalacao-antonio',
        permanent: true,
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;