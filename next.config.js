
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Se desactiva cualquier configuración PWA para evitar la generación de Service Workers
  // que puedan interferir con las peticiones a la base de datos de Firebase.
};

export default nextConfig;
