import type { NextConfig } from "next";

const chromiumBin = "./node_modules/@sparticuz/chromium/bin/**/*";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  outputFileTracingIncludes: {
    "/api/cron/refresh-prices": [chromiumBin],
    "/api/refresh-all": [chromiumBin],
    "/api/products/*/refresh": [chromiumBin],

    // Fallback to guarantee the chromium bin folder is included
    // for any server route that uses price-fetcher.ts.
    "/*": [chromiumBin],
  },
};

export default nextConfig;
