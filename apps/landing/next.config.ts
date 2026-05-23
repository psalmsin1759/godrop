import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.2'],
  turbopack: {
    root: require('path').resolve(__dirname, '../../'),
  },
};

export default nextConfig;
