export default function JoinPage() {
  const tiers = [
    { name: "Bronze", price: "Free", color: "#CD7F32", features: ["Newsletter access", "New release alerts", "Fan community"] },
    { name: "Silver", price: "$4/mo", color: "#C0C0C0", features: ["Everything in Bronze", "Early access to drops", "Behind-the-scenes content", "Exclusive merch discounts"] },
    { name: "Gold", price: "$12/mo", color: "#FFD700", features: ["Everything in Silver", "VIP event access", "Direct artist Q&A", "Limited edition collectibles", "Loyalty rewards"] },
  ];
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <span className="section-label text-sand-200">Fan Club</span>
        <h1 className="section-heading mt-2 mb-4" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>Join the Movement.</h1>
        <p className="font-body text-white/40 text-base max-w-lg mx-auto mb-12">Choose your level of access. Every tier supports our artists directly.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div key={t.name} className="card-surface p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                <h3 className="font-body text-lg font-semibold text-white">{t.name}</h3>
              </div>
              <p className="font-display text-3xl font-bold text-white mb-6">{t.price}</p>
              <ul className="space-y-2 mb-8">
                {t.features.map((f) => (
                  <li key={f} className="font-body text-sm text-white/40 flex items-start gap-2">
                    <span className="text-jade-400 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg text-sm font-semibold font-body transition-colors" style={{
                background: t.name === "Gold" ? t.color : "transparent",
                color: t.name === "Gold" ? "#07070a" : "#fff",
                border: t.name === "Gold" ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}>
                {t.price === "Free" ? "Join Free" : "Coming Soon"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
