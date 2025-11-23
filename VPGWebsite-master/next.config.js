/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Image Optimization (Optimized for low-spec VPS)
  images: {
    formats: ['image/webp'], // WebP only (AVIF is CPU-intensive)
    deviceSizes: [640, 750, 1080, 1920], // Reduced device sizes to save memory
    imageSizes: [16, 32, 64, 128, 256], // Reduced image sizes
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Reduce image quality to save CPU/memory on VPS
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance Optimizations
  compress: true, // Enable gzip compression
  swcMinify: true, // Use SWC for faster minification
  productionBrowserSourceMaps: false, // Disable source maps in production
  reactStrictMode: true, // Enable strict mode for better error detection
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Experimental features for better performance on low-spec VPS
  experimental: {
    // Optimize memory usage
    optimizePackageImports: ['@prisma/client', 'react-icons'],
    // Enable output file tracing for smaller Docker images
    outputFileTracingRoot: undefined,
    // Speed up builds
    webpackBuildWorker: true,
  },

  // Build performance optimizations
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Rewrites to serve uploaded files dynamically (fixes issue with images uploaded after build)
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/serve-upload/:path*',
      },
    ]
  },

  // Caching Headers
  async headers() {
    return [
      // Cache static images for 1 year
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache Next.js static files for 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache CSS and JS files for 1 year
      {
        source: '/:all*(css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache fonts for 1 year
      {
        source: '/:all*(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache API responses for 60 seconds (reduce database load)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
    ]
  },

  webpack(config, { isServer, dev }) {
    // Handle SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize for low memory VPS and faster builds
    if (!dev) {
      // Limit parallel processing to prevent hanging
      config.parallelism = 1;

      // Optimize cache for faster rebuilds
      config.cache = {
        type: 'filesystem',
        compression: 'gzip',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      };

      // Faster minification
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer.map((plugin) => {
            // Speed up terser
            if (plugin.constructor.name === 'TerserPlugin') {
              return {
                ...plugin,
                options: {
                  ...plugin.options,
                  parallel: 1, // Limit parallel processing
                  terserOptions: {
                    ...plugin.options?.terserOptions,
                    compress: {
                      ...plugin.options?.terserOptions?.compress,
                      passes: 1, // Reduce compression passes
                    },
                  },
                },
              };
            }
            return plugin;
          }),
        ],
      };
    }

    return config;
  },
}

module.exports = nextConfig
