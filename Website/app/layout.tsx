import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "TáradomeMusik — African Artistry. Global Legacy.",
  description:
    "Building lasting, profitable careers for our artists through transparent, data-informed, and creatively empowering partnership. An African-owned music institution.",
  metadataBase: new URL("https://taradomemusik.com"),
  openGraph: {
    title: "TáradomeMusik — African Artistry. Global Legacy.",
    description:
      "An African-owned music institution building legacy, one release at a time.",
    url: "https://taradomemusik.com",
    siteName: "TáradomeMusik",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TáradomeMusik",
    description: "African Artistry. Global Legacy.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-ink-950 text-white font-body antialiased">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
