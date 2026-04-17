/* ─── Artist + Release data ─── */

export const ARTISTS = [
  {
    name: "IRhay",
    slug: "irhay",
    origin: "Lagos, Nigeria",
    genre: "Afro-fusion",
    subGenre: "Afrobeats / Afro-fusion",
    tagline: "The hopeful dreamer",
    shortBio:
      "Soulful, introspective, emotionally expressive. Music that feels like a safe space.",
    heroImage: "/images/irhay-hero.jpg",
    profileImage: "/images/irhay-profile.jpg",
    brandColor: "#D4844C",
    brandGradient:
      "linear-gradient(135deg, #5C3D2E 0%, #D4844C 50%, #8D9A6A 100%)",
    socials: {
      spotify:
        "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
      audiomack: "https://audiomack.com/irhayofficial",
      boomplay: "https://www.boomplay.com/artists/56248576",
      youtube: "https://www.youtube.com/@irhayofficial",
      instagram: "https://www.instagram.com/irhayofficial",
      twitter: "https://x.com/irhayofficial",
      facebook:
        "https://www.facebook.com/share/RfLC1GH4UtoBiNCx/",
    },
  },
  {
    name: "Zvheer",
    slug: "zvheer",
    origin: "Ogun State / Abuja",
    genre: "Afro-fusion",
    subGenre: "Afro-fusion / Alt",
    tagline: "Cool without trying",
    shortBio:
      "Mysterious, street-aligned, globally fluent. Speaks when it matters, never overexposed.",
    heroImage: "/images/zvheer-hero.jpg",
    profileImage: "/images/zvheer-profile.jpg",
    brandColor: "#00FFFF",
    brandGradient:
      "linear-gradient(135deg, #0A0A0A 0%, #3C4F68 50%, #00FFFF 100%)",
    socials: {
      soundcloud: "https://on.soundcloud.com/q7XuPjxpdo8jikZ5XV",
    },
  },
] as const;

export type Artist = (typeof ARTISTS)[number];

export const RELEASES = [
  {
    title: "Easy On Me",
    artistSlug: "irhay",
    artistName: "IRhay",
    type: "Single" as const,
    date: "April 5, 2024",
    dateISO: "2024-04-05",
    presave: "https://onerpm.link/143394760138",
    coverImage: "/images/cover-easy-on-me.jpg",
    brandColor: "#D4844C",
    dsps: {
      spotify:
        "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
      audiomack: "https://audiomack.com/irhayofficial",
      boomplay: "https://www.boomplay.com/artists/56248576",
    },
  },
  {
    title: "Pandora",
    artistSlug: "irhay",
    artistName: "IRhay",
    type: "Single" as const,
    date: "August 18, 2023",
    dateISO: "2023-08-18",
    presave: "",
    coverImage: "/images/cover-pandora.png",
    brandColor: "#E8772E",
    dsps: {
      spotify:
        "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
      audiomack: "https://audiomack.com/irhayofficial",
      boomplay: "https://www.boomplay.com/artists/56248576",
    },
  },
  {
    title: "Wings",
    artistSlug: "irhay",
    artistName: "IRhay",
    type: "Single" as const,
    date: "February 4, 2023",
    dateISO: "2023-02-04",
    presave: "",
    coverImage: "/images/cover-wings.jpg",
    brandColor: "#8D9A6A",
    dsps: {
      spotify:
        "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
      audiomack: "https://audiomack.com/irhayofficial",
      boomplay: "https://www.boomplay.com/artists/56248576",
    },
  },
  {
    title: "Surface",
    artistSlug: "irhay",
    artistName: "IRhay",
    type: "EP" as const,
    date: "October 21, 2022",
    dateISO: "2022-10-21",
    presave: "",
    coverImage: "/images/cover-surface.jpg",
    brandColor: "#5C3D2E",
    dsps: {
      spotify:
        "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP",
      audiomack: "https://audiomack.com/irhayofficial",
    },
  },
] as const;

export type Release = (typeof RELEASES)[number];

/* ─── Ecosystem links ─── */
export const ECOSYSTEM = [
  {
    name: "TáradomeMusik",
    url: "/",
    active: true,
    color: "#ff6a3d",
    logo: "/images/logo-taradomemusik.png",
  },
  {
    name: "TaradomeFilms",
    url: "https://taradomefilms.com",
    active: false,
    color: "#7c3aed",
    logo: "/images/logo-taradomefilms.png",
  },
  {
    name: "TaraTech",
    url: "https://taratechent.com",
    active: true,
    color: "#2fe6b8",
    logo: "/images/logo-taratech.png",
  },
] as const;

/* ─── Site metadata ─── */
export const SITE = {
  name: "TáradomeMusik",
  tagline: "African Artistry. Global Legacy.",
  description:
    "Building lasting, profitable careers for our artists through transparent, data-informed, and creatively empowering partnership.",
  url: "https://taradomemusik.com",
  email: {
    general: "info@taradomemusik.com",
    booking: "booking@taradomemusik.com",
  },
  phone: {
    lagos: "+2349160123499",
    usa: "+16783798706",
  },
  address: "#5/7 Ademola Street, Ikoyi, Lagos",
  founded: 2021,
  parentLogo: "/images/logo-taradome-parent.png",
} as const;
