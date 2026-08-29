/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.mixkit.co' },
      { protocol: 'https', hostname: 'files.catbox.moe' },
    ],
  },
};

export default nextConfig;