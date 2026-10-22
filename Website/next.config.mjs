import path from "path";
import { fileURLToPath } from "url";

import { assertPublishableKey, assertReleasable } from "./release-gate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// No build while the postal address is a placeholder (TEOS privacy phase 1, review I-5).
assertReleasable(process.env);
// No Netlify/CI build without the Supabase publishable key for the chat's live feed (TEOS key rotation P-5).
assertPublishableKey(process.env);

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
