import type { Metadata } from "next";
import PrivacyLinkPage from "@/components/PrivacyLinkPage";

// Unsubscribe landing page (TEOS privacy phase 1). Opening it changes nothing; the button does.
export const metadata: Metadata = {
  title: "Unsubscribe | TáraDomeMusik",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function UnsubscribePage() {
  return <PrivacyLinkPage kind="unsubscribe" />;
}
