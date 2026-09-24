import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // netlify.toml env vars exist only at build time, not inside Netlify
  // Functions at runtime — inline BACKEND_URL so API routes can reach it.
  ...(process.env.BACKEND_URL && { env: { BACKEND_URL: process.env.BACKEND_URL } }),
};

export default nextConfig;
