import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config) => {
    // Guarantee the "@/..." path alias resolves to the app root regardless of
    // tsconfig path-plugin quirks under moduleResolution: "bundler".
    config.resolve.alias["@"] = __dirname;
    return config;
  },
};

export default nextConfig;
