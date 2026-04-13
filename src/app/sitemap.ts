import type { MetadataRoute } from "next";
import { trips } from "@content/travel/_meta";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://swapnil.dev"; // TODO: Update with actual domain

  const staticPages = ["", "/travel", "/projects", "/about", "/contact"].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
    })
  );

  const tripPages = trips.map((trip) => ({
    url: `${baseUrl}/travel/${trip.slug}`,
    lastModified: new Date(trip.startDate),
  }));

  return [...staticPages, ...tripPages];
}
