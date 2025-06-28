const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'gm', 'pdf2pic'],
    esmExternals: 'loose',
  },
  target: "experimental-serverless-trace",
};

module.exports = nextConfig;
