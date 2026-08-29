/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  transpilePackages: ['jwks-rsa', 'jose'],
};

export default nextConfig;