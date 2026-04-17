import Image from "next/image";
import Link from "next/link";
import { ARTISTS } from "@/lib/data";
const featured = ARTISTS[0];

export default function SpotlightPage() {
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <span className="section-label text-ember-400">Artist of the Month · April 2026</span>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image src={featured.heroImage} alt={featured.name} fill className="object-cover object-top" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
            <div className="absolute top-4 left-4 brand-pill text-[10px]">✦ Featured Artist</div>
          </div>
          <div>
            <h1 className="font-display text-5xl font-bold text-white mb-2">{featured.name}</h1>
            <p className="font-body text-sm text-white/40 mb-6">{featured.genre} · {featured.origin}</p>
            <blockquote className="font-display italic text-xl text-white/70 border-l-2 pl-4 mb-6" style={{ borderColor: featured.brandColor }}>
              &ldquo;Music that feels like a safe space.&rdquo;
            </blockquote>
            <p className="font-body text-sm text-white/40 leading-relaxed mb-4">
              IRhay&apos;s story is rooted in real experiences — from hope and hustle to upliftment. He represents the young dreamer who&apos;s not afraid to show cracks, share silence, or speak from the heart.
            </p>
            <p className="font-body text-sm text-white/40 leading-relaxed mb-8">
              This month we spotlight his evolving sound — soulful Afro-fusion rooted in emotional honesty and upliftment. Fans get early snippets, behind-the-scenes footage, and exclusive drops through the CRM.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/join" className="bg-ember-400 text-white px-6 py-3 rounded-lg text-sm font-semibold font-body no-underline hover:bg-ember-500 transition-colors">Join the fan list</Link>
              <Link href={`/artists/${featured.slug}`} className="border border-white/15 text-white px-6 py-3 rounded-lg text-sm font-semibold font-body no-underline hover:border-white/30 transition-colors">Full Profile →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
