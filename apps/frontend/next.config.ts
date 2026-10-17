import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  transpilePackages: ["@aurapath/shared"],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/assessment",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/assessment/:path*",
        destination: "/register",
        permanent: false,
      },
      {
        source: "/careers",
        destination: "/about",
        permanent: false,
      },
      {
        source: "/careers/:path*",
        destination: "/about",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;


