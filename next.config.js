
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Desactiva explícitamente la generación de Service Workers
  // para evitar conflictos con las peticiones de red de Firebase.
  experimental: {
    serviceWorker: false,
  },
};

export default nextConfig;
