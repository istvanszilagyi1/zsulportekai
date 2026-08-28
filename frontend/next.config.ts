import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '4e95f92e87.clvaw-cdnwnd.com',
      },
    ],
  },
};

export default nextConfig;
