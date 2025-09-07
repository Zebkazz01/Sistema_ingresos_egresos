/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore type errors during build for now
    ignoreBuildErrors: true,
  },
  // Disable strict mode for now to avoid some React 18 issues
  reactStrictMode: false,
  // Optimize for serverless functions
  poweredByHeader: false,
  // Ensure API routes work properly
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
}

module.exports = nextConfig
