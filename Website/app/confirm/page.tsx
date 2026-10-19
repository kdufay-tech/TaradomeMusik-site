import type { Metadata } from "next";
import PrivacyLinkPage from "@/components/PrivacyLinkPage";

// Double opt-in landing page (TEOS privacy phase 1). The link carries a one-time token: never
// indexed, and the token is never sent onward in a Referer.
export const metadata: Metadata = {
  title: "Confirm your email | TáraDomeMusik",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ConfirmPage() {
  return <PrivacyLinkPage kind="confirm" />;
}
