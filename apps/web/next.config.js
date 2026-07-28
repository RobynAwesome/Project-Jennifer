/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@jennifer/shared", "@jennifer/governance", "@jennifer/validation"],
};

module.exports = nextConfig;
