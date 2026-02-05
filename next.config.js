/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Ignora erros de TypeScript durante build de produção
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
