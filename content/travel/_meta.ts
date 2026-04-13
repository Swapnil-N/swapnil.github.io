export interface TripMeta {
  slug: string;
  title: string;
  lat: number;
  lng: number;
  startDate: string;
  excerpt: string;
  coverImage: string;
}

export const trips: TripMeta[] = [
  {
    slug: "japan-2024",
    title: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    startDate: "2024-03-15",
    excerpt: "Two weeks weaving through neon-lit streets and ancient temples.",
    coverImage: "/images/travel/japan-2024/cover.jpg",
  },
  {
    slug: "iceland-2023",
    title: "Iceland",
    lat: 64.1466,
    lng: -21.9426,
    startDate: "2023-06-01",
    excerpt: "Chasing waterfalls and the midnight sun along the Ring Road.",
    coverImage: "/images/travel/iceland-2023/cover.jpg",
  },
];
