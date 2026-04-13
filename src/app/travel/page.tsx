import { trips } from '@content/travel/_meta';
import TripTimeline from '@/components/travel/TripTimeline';
import PageTransition from '@/components/layout/PageTransition';
import GlobeSection from '@/components/travel/GlobeSection';

export default function TravelPage() {
  const globePins = trips.map((t) => ({
    lat: t.lat,
    lng: t.lng,
    title: t.title,
    slug: t.slug,
  }));

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Globe Section */}
        <section className="relative h-[60vh] md:h-[70vh] mb-12">
          <div className="absolute inset-0">
            <GlobeSection pins={globePins} />
          </div>
          <div className="relative z-10 flex items-end justify-center h-full pb-8 pointer-events-none">
            <h1 className="font-heading text-4xl md:text-6xl font-bold">
              Travels
            </h1>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <TripTimeline trips={trips} />
        </section>
      </div>
    </PageTransition>
  );
}
