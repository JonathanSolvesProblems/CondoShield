/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'gm', 'pdf2pic'],
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
