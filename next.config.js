
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true
    },
    webpack: (config, { isServer }) => {
        // Añadir un alias para el paquete 'process' para que funcione en el navegador
        if (!isServer) {
            config.resolve.alias['process'] = 'process/browser';
        }
        return config;
    }
};

export default nextConfig;
