import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is nested inside the tour workspace, which has its own lockfile.
  // Pin Turbopack here so module resolution never falls through to the parent.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
