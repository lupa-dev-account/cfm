const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'niivkjrhszjuyboqrirj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Disable source maps in development to avoid Turbopack source map issues
  productionBrowserSourceMaps: false,
  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },
  // Webpack configuration for better stability (optional - uncomment if issues persist)
  // webpack: (config, { dev }) => {
  //   if (dev) {
  //     config.devtool = false; // Disable source maps in dev
  //   }
  //   return config;
  // },
}

module.exports = withNextIntl(nextConfig);
