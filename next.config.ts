import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://chart-with-me.onrender.com/api/:path*',
      },
    ];
  },
};
export default nextConfig;
