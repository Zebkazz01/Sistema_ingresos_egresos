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
  experimental: {
    // Enable static exports if needed
    output: 'standalone',
  },
  // Disable strict mode for now to avoid some React 18 issues
  reactStrictMode: false,
}

module.exports = nextConfig
