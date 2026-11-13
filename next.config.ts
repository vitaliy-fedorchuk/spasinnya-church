import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Для VPS: збірка містить усе потрібне для запуску (node server.js)
  output: "standalone",
};

export default nextConfig;
