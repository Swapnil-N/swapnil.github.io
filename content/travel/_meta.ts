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
  // 2026
  {
    slug: "india-2026",
    title: "India",
    lat: 20.5937,
    lng: 78.9629,
    startDate: "2026-04-05",
    excerpt: "Three weeks exploring India — a journey through culture, chaos, and connection.",
    coverImage: "/images/travel/india-2026/cover.jpg",
  },
  {
    slug: "denver-winter-park-2026",
    title: "Denver & Winter Park",
    lat: 39.8868,
    lng: -105.7625,
    startDate: "2026-03-19",
    excerpt: "Another Colorado ski trip — this time carving turns at Winter Park.",
    coverImage: "/images/travel/denver-winter-park-2026/cover.jpg",
  },
  {
    slug: "mexico-city-2026",
    title: "Mexico City",
    lat: 19.4326,
    lng: -99.1332,
    startDate: "2026-02-11",
    excerpt: "A week in CDMX — tacos al pastor, ancient ruins, and vibrant neighborhoods.",
    coverImage: "/images/travel/mexico-city-2026/cover.jpg",
  },
  {
    slug: "costa-rica-2026",
    title: "Costa Rica",
    lat: 9.7489,
    lng: -83.7534,
    startDate: "2026-01-07",
    excerpt: "Pura vida — exploring Costa Rica's rainforests, beaches, and wildlife.",
    coverImage: "/images/travel/costa-rica-2026/cover.jpg",
  },
  // 2025
  {
    slug: "san-francisco-2025",
    title: "San Francisco",
    lat: 37.7749,
    lng: -122.4194,
    startDate: "2025-12-16",
    excerpt: "A winter week in the City by the Bay — fog, food, and the Golden Gate.",
    coverImage: "/images/travel/san-francisco-2025/cover.jpg",
  },
  {
    slug: "munich-berlin-2025",
    title: "Munich & Berlin",
    lat: 48.1351,
    lng: 11.5820,
    startDate: "2025-09-17",
    excerpt: "Oktoberfest in Munich and exploring Berlin — beer halls, history, and nightlife.",
    coverImage: "/images/travel/munich-berlin-2025/cover.jpg",
  },
  {
    slug: "charleston-2025",
    title: "Charleston",
    lat: 32.7765,
    lng: -79.9311,
    startDate: "2025-07-25",
    excerpt: "Exploring Charleston's historic streets, waterfront, and lowcountry cuisine.",
    coverImage: "/images/travel/charleston-2025/cover.jpg",
  },
  {
    slug: "seattle-crystal-2025",
    title: "Seattle & Crystal Mountain",
    lat: 47.6062,
    lng: -122.3321,
    startDate: "2025-04-25",
    excerpt: "Spring skiing at Crystal Mountain with views of Mount Rainier.",
    coverImage: "/images/travel/seattle-crystal-2025/cover.jpg",
  },
  {
    slug: "japan-2025",
    title: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    startDate: "2025-03-26",
    excerpt: "Cherry blossom season across Japan — from Tokyo's neon to Kyoto's temples to Osaka's street food.",
    coverImage: "/images/travel/japan-2025/cover.jpg",
  },
  {
    slug: "rio-carnival-2025",
    title: "Rio de Janeiro",
    lat: -22.9068,
    lng: -43.1729,
    startDate: "2025-02-22",
    excerpt: "Experiencing the energy and chaos of Rio's Carnival — samba, costumes, and nonstop celebration.",
    coverImage: "/images/travel/rio-carnival-2025/cover.jpg",
  },
  {
    slug: "denver-steamboat-2025",
    title: "Denver & Steamboat Springs",
    lat: 40.4850,
    lng: -106.8317,
    startDate: "2025-02-06",
    excerpt: "Hitting the slopes at Steamboat Springs — champagne powder and mountain views.",
    coverImage: "/images/travel/denver-steamboat-2025/cover.jpg",
  },
  {
    slug: "new-orleans-2025",
    title: "New Orleans",
    lat: 29.9511,
    lng: -90.0715,
    startDate: "2025-01-18",
    excerpt: "A long weekend in the Big Easy — jazz, beignets, and Bourbon Street.",
    coverImage: "/images/travel/new-orleans-2025/cover.jpg",
  },
  // 2024
  {
    slug: "guatemala-2024",
    title: "Guatemala",
    lat: 14.6349,
    lng: -90.6577,
    startDate: "2024-11-08",
    excerpt: "Hiking through Guatemala's volcanic highlands on Volcán Santiago.",
    coverImage: "/images/travel/guatemala-2024/cover.jpg",
  },
  {
    slug: "vegas-zion-2024",
    title: "Las Vegas, Zion & Grand Canyon",
    lat: 36.1699,
    lng: -115.1398,
    startDate: "2024-09-06",
    excerpt: "A week exploring the desert Southwest — from the Vegas strip to the canyon floor.",
    coverImage: "/images/travel/vegas-zion-2024/cover.jpg",
  },
  {
    slug: "detroit-eclipse-2024",
    title: "Detroit: Total Solar Eclipse",
    lat: 42.3314,
    lng: -83.0458,
    startDate: "2024-04-04",
    excerpt: "Traveled to Detroit to witness the total solar eclipse — a once-in-a-lifetime celestial event.",
    coverImage: "/images/travel/detroit-eclipse-2024/cover.jpg",
  },
];
