import Link from "next/link";

const items = [
  { href: "/", label: "Home" },
  { href: "/artists", label: "Artists" },
  { href: "/releases", label: "Releases" },
  { href: "/spotlight", label: "Spotlight" },
  { href: "/studio", label: "Studio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Menu() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold">Menu</h1>
      <div className="mt-8 grid gap-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10">
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
