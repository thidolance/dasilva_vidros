import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer usa módulos Node que não funcionam no Edge Runtime
  serverExternalPackages: ['@react-pdf/renderer', 'canvas'],
};

export default nextConfig;
