/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "**", protocol: "https" }],
    unoptimized: true,
  },
};

export default nextConfig;
