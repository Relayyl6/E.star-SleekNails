/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.mixkit.co' },
      { protocol: 'https', hostname: 'files.catbox.moe' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'instagram.com' },
      { protocol: 'https', hostname: 'www.instagram.com' },
      { protocol: 'https', hostname: 'vtdc9cwfow687z69.public.blob.vercel-storage.com' }
    ],
  },
};

export default nextConfig;