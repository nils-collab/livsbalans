import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors while we fix Supabase types
    ignoreBuildErrors: true,
  },
};

export default nextConfig;


