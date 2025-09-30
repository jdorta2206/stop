/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Opciones para deshabilitar la advertencia de fuente de Google Fonts si es necesario
  experimental: {
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
    ],
  },
  // Si tienes imágenes de dominios externos, configúralos aquí
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
       {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;
