import path from "path";
import { fileURLToPath } from "url";

import { assertPublishableKey, assertReleasable } from "./release-gate.mjs";
import { SecretScanPlugin } from "./build-output-scan.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// No build while the postal address is a placeholder (TEOS privacy phase 1, review I-5).
assertReleasable(process.env);
// Supabase key gate (TEOS key rotation P-5): no build at all with a secret key or JWT in the publishable variable;
// no Netlify/CI build without a valid publishable key (a local build only warns).
assertPublishableKey(process.env);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config, { dev }) => {
    // Guarantee the "@/..." path alias resolves to the app root regardless of
    // tsconfig path-plugin quirks under moduleResolution: "bundler".
    config.resolve.alias["@"] = __dirname;
    // P-5 fix round (review F-1): a production build fails if any emitted asset holds a Supabase secret key or a
    // JWT (build-output-scan.mjs; counts only). `npm run build` also scans the exported out/ afterwards (postbuild).
    if (!dev) {
      config.plugins = config.plugins || [];
      config.plugins.push(new SecretScanPlugin());
    }
    return config;
  },
};

export default nextConfig;
