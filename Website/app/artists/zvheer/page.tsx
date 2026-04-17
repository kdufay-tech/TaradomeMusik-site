import Image from "next/image";
import Link from "next/link";
import { ARTISTS } from "@/lib/data";

const artist = ARTISTS[1]; // Zvheer

export default function ZvheerPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        <Image src={artist.heroImage} alt={artist.name} fill className="object-cover object-top" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-[3px] h-5 rounded-sm bg-zvheer-primary" />
              <span className="text-white/50 text-xs font-body tracking-[0.1em] uppercase">{artist.origin}</span>
            </div>
            <h1 className="font-display text-white font-bold mb-2" style={{ fontSize: "clamp(48px, 8vw, 80px)" }}>
              {artist.name}
            </h1>
            <p className="font-body text-lg text-white/50">{artist.subGenre}</p>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="section-label text-zvheer-primary">About</span>
            <h2 className="section-heading mt-2 mb-6">Cool Without Trying</h2>
            <p className="font-body text-white/45 leading-relaxed mb-4">
              Zvheer&apos;s image reflects a balance of confidence and control. He&apos;s cool
              without needing to be loud, stylish without trying too hard. The energy is
              clean, mysterious, street-aligned but globally fluent.
            </p>
            <p className="font-body text-white/45 leading-relaxed mb-4">
              His fashion is bold, experimental streetwear with a futuristic twist — blending
              structured dark tones with pops of electric colors. Zvheer speaks when it matters,
              never overexposed.
            </p>
            <p className="font-body text-white/45 leading-relaxed mb-6">
              His color palette combines deep blacks, steel blues, electric cyans, and dark maroons —
              creating a visual identity that&apos;s as distinctive as his sound.
            </p>

            {/* SoundCloud embed */}
            <div className="mt-6">
              <iframe
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/zvheer&color=%2300FFFF&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
                className="rounded-lg"
              />
            </div>

            {/* Notify */}
            <div className="mt-8 p-5 card-surface">
              <p className="font-body text-sm text-white/50 mb-3">
                Zvheer&apos;s first release is coming. Get notified.
              </p>
              <form className="flex gap-3" action="/api/crm/subscribe" method="POST">
                <input type="hidden" name="artist" value="zvheer" />
                <input type="email" name="email" placeholder="your@email.com" required
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm font-body text-white placeholder:text-white/25 focus:outline-none focus:border-zvheer-primary/40 transition-colors"
                />
                <button type="submit"
                  className="bg-zvheer-secondary text-white px-5 py-2.5 rounded-lg text-sm font-semibold font-body hover:bg-zvheer-secondary/80 transition-colors"
                >
                  Notify Me
                </button>
              </form>
            </div>
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <Image src="/images/zvheer-profile.jpg" alt="Zvheer profile" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 px-6 bg-ink-900 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <span className="section-label text-zvheer-primary">Gallery</span>
          <h2 className="section-heading mt-2 mb-8">Visuals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["/images/zvheer-alt-1.jpg", "/images/zvheer-alt-2.jpg", "/images/zvheer-alt-3.jpg",
              "/images/zvheer-alt-4.jpg", "/images/zvheer-alt-5.jpg", "/images/zvheer-alt-6.jpg",
              "/images/zvheer-alt-7.jpg", "/images/zvheer-alt-8.jpg"].map((src, i) => (
              <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={src} alt={`Zvheer photo ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="py-8 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <Link href="/artists" className="font-body text-sm text-white/30 no-underline hover:text-white/60 transition-colors">
            ← Back to Artists
          </Link>
        </div>
      </div>
    </div>
  );
}
