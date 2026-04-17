export const site = {
  name: "TáradomeMusik",
  tagline: "Artist-centric. Data-informed. Afro-forward.",
  presaveUrl: "https://onerpm.link/143394760138",

  contact: {
    email: "info@taradomemusik.com",
    bookingEmail: "booking@taradomemusik.com",
    phones: ["+2348060112549", "+2349160123499", "+16783798706"],
    address: "#5/7 Ademola Street, Ikoyi, Lagos, Nigeria",
  },

  socials: [
    { name: "Instagram", href: "https://www.instagram.com/taradomemusik_/", icon: "IG" },
    { name: "YouTube",   href: "https://www.youtube.com/",                   icon: "YT" },
    { name: "X",         href: "https://x.com/",                             icon: "X"  },
    { name: "TikTok",    href: "https://www.tiktok.com/",                    icon: "TK" },
  ],

  mission:
    "To build lasting, profitable careers for our artists through a transparent, data-informed, and creatively empowering partnership.",

  missionLong:
    "TáradomeMusik was founded on a conviction: African artists deserve more than a platform — they deserve a partner who fights for ownership, invests in development, and builds toward generational wealth. Rooted in Lagos, distributed globally.",

  principles: [
    { title: "Artist-Centricity",       desc: "Artists are primary stakeholders in every decision we make." },
    { title: "Masters Ownership",        desc: "Artists retain their catalog. Always. No exceptions." },
    { title: "Data-Informed Creativity", desc: "Fan analytics combined with instinct and cultural knowledge." },
    { title: "Operational Excellence",   desc: "Repeatable systems that scale with the roster." },
    { title: "Global Distribution",      desc: "From Lagos to London to Los Angeles — and everywhere between." },
    { title: "Cultural Legacy",          desc: "Preserving and projecting the African creative tradition." },
  ],

  heroImages: [
    "https://images.unsplash.com/photo-1520962917968-356a9f3b1b88?auto=format&fit=crop&w=2200&q=80",
    "https://images.unsplash.com/photo-1544604862-6b83b923d0a3?auto=format&fit=crop&w=2200&q=80",
  ],

  stats: [
    { value: "2021",  label: "Founded"           },
    { value: "2",     label: "Artists on Roster" },
    { value: "3",     label: "Releases Out Now"  },
    { value: "Lagos", label: "Headquarters"      },
  ],

  roster: [
    // ── IRhay ─────────────────────────────────────────────────────────────
    {
      slug: "irhay",
      name: "IRhay",
      origin: "Lagos, Nigeria",
      genre: "Afro-fusion",
      subgenres: ["Afrobeats", "Afro-fusion", "Reggae", "Highlife"],
      tagline: "The voice of the hopeful dreamer.",
      status: "active" as const,

      // Replace with real press shot when available
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",

      // Brand palette: Warm Earth Brown → Burnt Orange (phoenix energy, warm light)
      cardGradient: "linear-gradient(155deg, #2a1a0e 0%, #5c3d2e 45%, #d4844c 100%)",

      // Brand colors from IRhay brand book
      brandColors: {
        warmEarthBrown: "#5C3D2E",
        burntOrange:    "#D4844C",
        dustyOlive:     "#8D9A6A",
        creamBeige:     "#F5EEE6",
        deepTeal:       "#2C5E5A",
      },
      accentColor: "#D4844C", // Burnt Orange — primary accent for IRhay pages

      bio: "IRhay is the voice of the hopeful dreamer — soulful, introspective, and emotionally honest. His Afro-fusion sound blends warmth, vulnerability, and upliftment into music that feels like a safe space for the generation navigating hustle, heartbreak, and healing.",
      bioLong:
        "Hailing from Lagos, IRhay has established himself as one of Afro-fusion's most authentic voices. His releases 'Easy On Me' and 'Wings' demonstrate a rare ability to fuse Afrobeats grooves with soul-forward storytelling — music that is hopeful but layered, stylish but grounded. He represents the relatable dreamer who wears his feelings with subtle flair.",

      brandNarrative:
        "IRhay's story is rooted in real experiences — from hope and hustle to upliftment. He represents the young dreamer who's not afraid to show cracks, share silence, or speak from the heart.",

      comps: ["Chance The Rapper", "Khalid", "Patoranking", "Ed Sheeran", "YG Marley", "Joeboy"],
      themes: ["Hope", "Resilience", "Upliftment", "Ambition & The Hustle", "Love & Human Connection", "Self Discovery", "Positivity"],
      targetAudience: ["Millennials", "Gen Z"],

      links: {
        instagram: "https://www.instagram.com/irhayofficial",
        spotify:   "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
        youtube:   "https://www.youtube.com/@irhayofficial",
        twitter:   "https://x.com/irhayofficial",
        facebook:  "https://www.facebook.com/share/RfLC1GH4UtoBiNCx/",
        audiomack: "https://audiomack.com/irhayofficial",
        boomplay:  "https://www.boomplay.com/artists/56248576",
      },

      featured: true,
    },

    // ── Zvheer ────────────────────────────────────────────────────────────
    {
      slug: "zvheer",
      name: "Zvheer",
      origin: "Ogun State / Abuja, Nigeria",
      genre: "Afro-fusion",
      subgenres: ["Afro-fusion", "Afrobeats", "Hip-Hop"],
      tagline: "His presence is felt, not forced.",
      status: "coming-soon" as const,

      // Replace with real Zvheer photo when available
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",

      // Brand palette: Midnight Black → Steel Blue → Electric Cyan (calm disruption)
      cardGradient: "linear-gradient(155deg, #0a0a0a 0%, #3c4f68 55%, #00e5ff 100%)",

      // Brand colors from Zvheer brand book
      brandColors: {
        midnightBlack: "#0A0A0A",
        steelBlue:     "#3C4F68",
        electricCyan:  "#00FFFF",
        darkMaroon:    "#5B1A28",
        ashGrey:       "#B1B1B1",
      },
      accentColor: "#00FFFF", // Electric Cyan — primary accent for Zvheer pages

      bio: "Zvheer is the next-gen sound disruptor — cool, layered, and creatively unpredictable. He blends street roots with global edge, carrying the quiet confidence of someone who knows exactly what he's doing.",
      bioLong:
        "Born Tajudeen Samad Olanrewaju Zaheer in Sano Otta, Ogun State in 2003 and raised in Abuja, Zvheer began making music at ten years old. A Computer Science student at Redeemer's University, Ede, he has refined a signature sound that fuses Afrobeats, Afro-fusion, and hip-hop. Zvheer doesn't follow trends — he sets them.",

      brandNarrative:
        "Zvheer is the idea that you can be calm and still change everything. His music isn't just for the vibe — it's a reflection of someone forged through fire, who found clarity and now creates with purpose.",

      comps: ["Tyler, the Creator", "Rema", "Stormzy", "Wizkid", "Skepta", "Saint Jhn"],
      themes: ["Silent Confidence", "Street Intelligence", "Calculated Rebellion", "Escape & Imagination"],
      targetAudience: ["Gen Z", "Gen Alpha"],

      links: {
        // Pre-release — no public links yet
      },

      featured: false,
    },
  ],

  releases: [
    {
      id: "easy-on-me",
      title: "Easy On Me",
      artist: "IRhay",
      artistSlug: "irhay",
      date: "2024-04-05",
      type: "Single",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
      previewUrl: "/audio/easy-on-me-preview.mp3",
      dspLinks: {
        presave:   "https://onerpm.link/143394760138",
        spotify:   "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
        audiomack: "https://audiomack.com/irhayofficial",
        boomplay:  "https://www.boomplay.com/artists/56248576",
      },
    },
    {
      id: "wings",
      title: "Wings",
      artist: "IRhay",
      artistSlug: "irhay",
      date: "2023-02-04",
      type: "Single",
      cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80",
      previewUrl: "/audio/wings-preview.mp3",
      dspLinks: {
        spotify:   "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
        audiomack: "https://audiomack.com/irhayofficial",
        boomplay:  "https://www.boomplay.com/artists/56248576",
      },
    },
    {
      id: "surface",
      title: "Surface",
      artist: "IRhay",
      artistSlug: "irhay",
      date: "2022-10-21",
      type: "Single",
      cover: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=900&q=80",
      previewUrl: "/audio/surface-preview.mp3",
      dspLinks: {
        spotify:   "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
        audiomack: "https://audiomack.com/irhayofficial",
      },
    },
  ],

  artistOfTheMonth: {
    month: "April 2026",
    artistSlug: "irhay",
    headline: "The relatable dreamer, in full light.",
    spotlightCopy:
      "This month we spotlight IRhay's evolving sound — soulful Afro-fusion rooted in emotional honesty and upliftment. Fans get early snippets, behind-the-scenes footage, and exclusive drops through the CRM.",
    ctaText: "Join the fan list",
    quote: "Music that feels like a safe space.",
  },

  ecosystem: [
    { name: "TáradomeMusik", href: "/",                         active: true  },
    { name: "TaradomeFilms", href: "https://taradomefilms.com", active: false },
    { name: "TaraTech",      href: "https://taratechent.com",   active: false },
  ],
};

export type Artist       = (typeof site.roster)[number];
export type Release      = (typeof site.releases)[number];
export type ArtistStatus = "active" | "coming-soon";
