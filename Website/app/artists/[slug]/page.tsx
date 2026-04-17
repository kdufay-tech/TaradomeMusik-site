import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";

export function generateStaticParams() {
  return site.roster.map((artist) => ({
    slug: artist.slug,
  }));
}

export default function ArtistPage({ params }: { params: { slug: string } }) {
  const a = site.roster.find((x) => x.slug === params.slug);
  if (!a) return notFound();

  const releases = site.releases.filter((r) => r.artist.toLowerCase() === a.name.toLowerCase());

  return (
    <Section>
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <Image src={a.image} alt={a.name} fill className="object-cover" />
          </div>
        </div>
        <div className="md:col-span-7">
          <div className="text-xs text-white/60">{a.origin} · {a.genre}</div>
          <h1 className="mt-2 text-4xl font-semibold">{a.name}</h1>
          <p className="mt-4 text-sm text-white/70">{a.bio}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/join">Join fan list</Button>
            <Button href={a.links.spotify || "#"} variant="ghost">Listen</Button>
            <Button href={a.links.instagram || "#"} variant="ghost">Instagram</Button>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Embed this artist anywhere</div>
            <p className="mt-2 text-sm text-white/70">
              Drop this snippet into the artist’s personal site to render a live “Taradome” card with
              latest release + CRM sign-up.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-ink-900 p-4 text-xs text-white/80">{`<script src="https://YOURDOMAIN.com/widgets/taradome-artist.js" data-artist="${a.slug}" defer></script>`}</pre>
          </div>

          {releases.length > 0 && (
            <div className="mt-10">
              <div className="text-sm font-semibold">Releases</div>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {releases.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-white/10 bg-ink-950/40 px-4 py-3">
                    {r.title} <span className="text-white/50">· {r.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
