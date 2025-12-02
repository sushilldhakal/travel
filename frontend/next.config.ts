import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
  // Turbopack configuration to handle canvas dependency
  turbopack: {
    resolveAlias: {
      // Stub out canvas module (used by konva in react-filerobot-image-editor)
      canvas: './canvas-stub.js',
    },
  },
};

export default nextConfig;
