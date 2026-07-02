import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  basePath: isStaticExport ? "/project-hub" : undefined,
  output: isStaticExport ? "export" : "standalone",
  reactStrictMode: true,
  trailingSlash: isStaticExport,
};

export default nextConfig;
