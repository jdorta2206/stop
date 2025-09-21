
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Se elimina la opción `output: 'export'` para permitir la comunicación
  // en tiempo real con la base de datos de Firebase, solucionando
  // los errores de red al crear salas.
};

export default nextConfig;
