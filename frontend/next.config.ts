import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize webpack configuration to prevent cache issues
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable webpack cache in development to prevent cache corruption
      config.cache = false;
      
      // Optimize file watching
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    
    return config;
  },
  
  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Optimize images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable compression
  compress: true,
  
  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
