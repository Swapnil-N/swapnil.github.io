export default function ProjectsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card h-56" />
        ))}
      </div>
    </div>
  );
}
