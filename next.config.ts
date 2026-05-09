import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // OneDrive-synced folders can leave Turbopack's persistent cache in a
    // partially missing state between dev sessions, which crashes startup.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
