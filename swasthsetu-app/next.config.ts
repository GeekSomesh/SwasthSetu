import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Next uses this app folder as the workspace root.
    root: process.cwd(),
  },
  allowedDevOrigins: ["192.168.1.44"],
};

export default nextConfig;
