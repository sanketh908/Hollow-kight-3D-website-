import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones on the LAN load dev-server scripts (next dev blocks other origins).
  allowedDevOrigins: ["192.168.0.100"],
};

export default nextConfig;
