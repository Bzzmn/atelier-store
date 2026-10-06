import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Sample imagery. `search` is omitted so Unsplash sizing params
      // (?w=…&fit=crop) are allowed; the source stays capped at that width.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/photo-*",
      },
    ],
  },
};

export default nextConfig;
