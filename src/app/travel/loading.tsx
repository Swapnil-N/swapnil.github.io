export default function TravelLoading() {
  return (
    <div className="animate-pulse">
      {/* Globe placeholder */}
      <div className="h-[60vh] bg-gradient-to-b from-card to-surface" />

      {/* Timeline card skeletons */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card h-48" />
        ))}
      </div>
    </div>
  );
}
