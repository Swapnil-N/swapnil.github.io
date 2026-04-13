import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login/", "/family-tree/"],
    },
    sitemap: "https://swapnil.dev/sitemap.xml", // TODO: Update domain
  };
}
