import { config } from 'dotenv';
config({ path: '.env.local' });

const nextConfig = {
  experimental: {
    serverActions: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.communitydragon.org'
      }
    ]
  }
};

export default nextConfig;
