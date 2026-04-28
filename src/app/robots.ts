import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ['/login', '/family-tree', '/auth', '/api'],
    },
    sitemap: "https://swapnil.dev/sitemap.xml",
  };
}
