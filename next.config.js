
/** @type {import('next').NextConfig} */
import withPWA from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    output: 'export',
};

export default pwaConfig(nextConfig);
