import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: 'export',
 // trailingSlash: true, // Agrega esto para que S3 encuentre las rutas correctamente
  images: { unoptimized: true },
  
  // Configuración para SVGs
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;