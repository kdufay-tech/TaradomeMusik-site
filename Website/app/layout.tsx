import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "TaradomeMusik",
  description: "Artist-centric, data-informed, Afro-forward label platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="afroGlow fixed inset-0 -z-20" />
        <div className="grain fixed inset-0 -z-10" />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
