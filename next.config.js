/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Desativa a exportação estática problemática para caminhos que estão quebrando
  output: 'standalone',
};

module.exports = nextConfig;
