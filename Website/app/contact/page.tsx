import { SITE } from "@/lib/data";

export default function ContactPage() {
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="section-label text-ember-400">Get in Touch</span>
        <h1 className="section-heading mt-2 mb-4" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>Contact.</h1>
        <p className="font-body text-white/40 text-base max-w-lg mb-12 leading-relaxed">
          For sync licensing, press inquiries, booking, or partnership opportunities.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {[
              { label: "General Inquiries", value: SITE.email.general, href: `mailto:${SITE.email.general}` },
              { label: "Booking & Events", value: SITE.email.booking, href: `mailto:${SITE.email.booking}` },
              { label: "Lagos Office", value: "+234 916 012 3499", href: `tel:${SITE.phone.lagos}` },
              { label: "USA Office", value: "+1 678 379 8706", href: `tel:${SITE.phone.usa}` },
            ].map((c) => (
              <div key={c.label} className="card-surface p-5">
                <p className="font-body text-[11px] text-white/40 tracking-wide uppercase mb-1">{c.label}</p>
                <a href={c.href} className="font-body text-base text-white no-underline hover:text-ember-400 transition-colors">{c.value}</a>
              </div>
            ))}
            <div className="card-surface p-5">
              <p className="font-body text-[11px] text-white/40 tracking-wide uppercase mb-1">Address</p>
              <p className="font-body text-base text-white/70">{SITE.address}</p>
            </div>
          </div>
          <form className="space-y-4">
            {[
              { name: "name", label: "Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "subject", label: "Subject", type: "text" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block font-body text-xs text-white/40 mb-1.5 tracking-wide uppercase">{f.label}</label>
                <input type={f.type} name={f.name} required className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm font-body text-white focus:outline-none focus:border-ember-400/40 transition-colors" />
              </div>
            ))}
            <div>
              <label className="block font-body text-xs text-white/40 mb-1.5 tracking-wide uppercase">Message</label>
              <textarea name="message" rows={5} required className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm font-body text-white focus:outline-none focus:border-ember-400/40 transition-colors resize-none" />
            </div>
            <button type="submit" className="w-full bg-ember-400 text-white py-3.5 rounded-lg text-sm font-semibold font-body hover:bg-ember-500 transition-colors">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}
