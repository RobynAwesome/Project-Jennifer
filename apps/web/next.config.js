/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@jennifer/shared", "@jennifer/governance", "@jennifer/validation"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

module.exports = nextConfig;
