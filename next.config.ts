import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      { source: "/@:username", destination: "/user/:username" },
      { source: "/@:username/:slug", destination: "/user/:username/:slug" },
    ];
  },
};

export default nextConfig;
