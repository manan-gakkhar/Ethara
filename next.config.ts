import type { NextConfig } from "next";

// Railway automatically sets RAILWAY_PUBLIC_DOMAIN at build/runtime.
// If present, use it to set NEXTAUTH_URL so Google OAuth callbacks work in production.
if (process.env.RAILWAY_PUBLIC_DOMAIN && !process.env.NEXTAUTH_URL?.includes("railway")) {
  process.env.NEXTAUTH_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}

const nextConfig: NextConfig = {};

export default nextConfig;
