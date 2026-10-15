/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Habilita forbidden() (responde 403) y unauthorized() (responde 401) en Next 16
    authInterrupts: true,
  },
}

export default nextConfig
