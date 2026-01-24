import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com",
        pathname: "/static/img/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/opensea-static/**",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/coins/images/**",
      },
      {
        protocol: "https",
        hostname: "**.bscscan.com",
      },
      {
        protocol: "https",
        hostname: "assets.pancakeswap.finance",
      },
      {
        protocol: "https",
        hostname: "tokens.pancakeswap.finance",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "strapi-dev.scand.app",
      },
    ],
  },
};

export default nextConfig;
