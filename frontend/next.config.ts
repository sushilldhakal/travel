import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // ❌ Disable Turbopack completely
  // This is the KEY part (env variable is ignored in Next.js 15/16)
  turbo: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Your existing alias for react-filerobot-image-editor
  turbopack: {
    resolveAlias: {
      canvas: './canvas-stub.js',
    },
  },
};

export default nextConfig;
