import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Для аватарок из Google Akкаунтов
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", // Для картинок фан-артов из Supabase Storage
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  allowedDevOrigins: ["192.168.31.214"],
};

export default nextConfig;