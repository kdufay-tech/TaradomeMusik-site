import { site } from "@/data/site";
import { Section } from "@/components/Section";

export default function Contact() {
  return (
    <Section>
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-3 text-sm text-white/70">Bookings, partnerships, press, and general inquiries.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold">Reach us</div>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <div>{site.contact.address}</div>
            <div>{site.contact.phones.join(" · ")}</div>
            <div>{site.contact.email}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold">Demo submissions</div>
          <p className="mt-2 text-sm text-white/70">
            Artists can submit demos and links. Submissions should be logged in the Modern Music CRM under
            “Artist Submissions” with tags for genre, location, and status.
          </p>
          <form className="mt-4 grid gap-3" action="/demo">
            <input className="h-12 rounded-2xl border border-white/10 bg-ink-900 px-4 text-sm outline-none focus:border-ember-500/60" placeholder="Artist name" name="name" required />
            <input className="h-12 rounded-2xl border border-white/10 bg-ink-900 px-4 text-sm outline-none focus:border-ember-500/60" placeholder="Email" name="email" type="email" required />
            <input className="h-12 rounded-2xl border border-white/10 bg-ink-900 px-4 text-sm outline-none focus:border-ember-500/60" placeholder="Links (Spotify/YouTube/SoundCloud)" name="links" required />
            <textarea className="min-h-[110px] rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-sm outline-none focus:border-ember-500/60" placeholder="Message" name="message" />
            <button className="h-12 rounded-2xl bg-ember-500 text-sm font-medium text-black hover:bg-ember-400">Submit</button>
          </form>
          <div className="mt-2 text-xs text-white/55">Wire this form to <span className="text-white">/api/artist-intake</span> in production.</div>
        </div>
      </div>
    </Section>
  );
}
