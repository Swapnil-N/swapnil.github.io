import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fashion Designer Bio — Demo',
  robots: { index: false, follow: false },
};

const LOOKS = [
  { n: '01', title: 'Linen Long Coat', gradient: 'bg-gradient-to-br from-amber-200 via-orange-200 to-rose-300' },
  { n: '02', title: 'Indigo Wrap Dress', gradient: 'bg-gradient-to-br from-indigo-300 via-blue-400 to-slate-600' },
  { n: '03', title: 'Wool Tunic', gradient: 'bg-gradient-to-br from-stone-300 via-amber-200 to-stone-500' },
  { n: '04', title: 'Pleated Skirt', gradient: 'bg-gradient-to-br from-rose-200 via-pink-300 to-stone-400' },
  { n: '05', title: 'Cropped Jacket', gradient: 'bg-gradient-to-br from-emerald-200 via-teal-300 to-stone-500' },
  { n: '06', title: 'Silk Scarf', gradient: 'bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400' },
] as const;

export default function FashionDesignerBioPage() {
  return (
    <main className="bg-stone-50 text-stone-900 min-h-screen">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-rose-100 to-stone-200" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-50/40 via-transparent to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-700 mb-6">
            Fashion Designer · Lookbook 2026
          </p>
          <h1 className="font-heading text-6xl md:text-8xl font-bold leading-[0.9] text-stone-950">
            Fashion<br />Designer<br />Bio
          </h1>
          <p className="mt-8 text-lg text-stone-700 max-w-md">
            Slow-made garments rooted in craft, color, and considered silhouettes.
          </p>
        </div>
      </section>

      {/* Lookbook */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <h2 className="font-heading text-4xl font-semibold">Lookbook</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-stone-600">SS / 2026</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOOKS.map((look) => (
            <figure key={look.n} className="group relative aspect-[3/4] overflow-hidden">
              <div className={`absolute inset-0 ${look.gradient} transition-transform duration-700 group-hover:scale-105`} />
              <figcaption className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/40 via-black/0 to-transparent">
                <span className="font-mono text-xs uppercase tracking-widest text-white/90">Look {look.n}</span>
                <span className="font-heading text-xl text-white mt-1">{look.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-stone-100 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-700 mb-6">About</p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold mb-8 leading-tight">
            A practice of patience, fabric, and quiet rebellion.
          </h2>
          <p className="text-lg leading-relaxed text-stone-700">
            Working from a small studio, the designer builds a single collection each
            season — cutting from natural fibers, dyeing by hand, and finishing every
            piece on a single sewing machine. The result: garments that age with their
            wearer, refuse trend cycles, and live in the wardrobe like old friends.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-700 mb-6">Contact</p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold mb-6">
            Inquire about a piece.
          </h2>
          <p className="text-lg text-stone-700 mb-10 max-w-xl mx-auto">
            For commissions, press, or stockist inquiries — write directly. Replies within 48 hours.
          </p>
          <a
            href="mailto:hello@example.com"
            className="inline-block border-2 border-stone-900 text-stone-900 font-medium px-8 py-3 hover:bg-stone-900 hover:text-stone-50 transition-colors"
          >
            hello@example.com
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center font-mono text-xs uppercase tracking-widest text-stone-500">
        © 2026 — All garments hand-cut
      </footer>
    </main>
  );
}
