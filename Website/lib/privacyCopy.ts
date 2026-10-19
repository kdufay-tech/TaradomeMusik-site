/* ─── Copy for the /confirm and /unsubscribe pages (TEOS privacy phase 1) ───
 * One place, so the text the owner approves is exactly the text the pages render. Shown in full in
 * the TEOS report task-p1-report.md for approval before this ships. {name} is the artist (or the
 * label) the email came from.
 */

export const PRIVACY_EMAIL = "privacy@taradomemusik.com";

export type Copy = { title: string; body: string[]; button?: string };

export function confirmCopy(state: string, name: string): Copy {
  switch (state) {
    case "valid":
      return {
        title: "Confirm you want news from " + name,
        body: [
          "Click the button to start getting news from " + name + " by email: new music, shows and offers.",
          "You can unsubscribe at any time with the link at the bottom of every email.",
        ],
        button: "Yes, send me news",
      };
    case "confirmed":
      return {
        title: "You're confirmed",
        body: [
          "Thanks! News from " + name + " will now come to your inbox.",
          "You can unsubscribe at any time with the link at the bottom of every email.",
        ],
      };
    case "used":
      return {
        title: "This link has already been used",
        body: ["If you clicked it before, you're all set: there's nothing more to do."],
      };
    case "expired":
      return {
        title: "This link has expired",
        body: [
          "Confirmation links work for 7 days. Sign up again on taradomemusik.com and we'll send you a new one.",
          "Until you confirm, we won't send you any news.",
        ],
      };
    case "error":
      return { title: "Something went wrong", body: ["Please try again in a minute."] };
    default:
      return {
        title: "This link isn't valid",
        body: [
          "Please use the link exactly as it appears in your email.",
          "Until you confirm, we won't send you any news.",
        ],
      };
  }
}

export function unsubscribeCopy(state: string, name: string): Copy {
  const after = [
    "We keep only a scrambled (hashed) copy of your email address, so we never add you back by mistake.",
    "Changed your mind? Sign up again on taradomemusik.com and confirm from your inbox.",
    "Questions about your data: " + PRIVACY_EMAIL + ".",
  ];
  switch (state) {
    case "valid":
      return {
        title: "Unsubscribe from " + name + " emails?",
        body: [
          "Click the button and we'll stop sending marketing emails from " + name + " to this address straight away.",
          "You stay in the fan community. Emails you need for things you've bought or asked for, such as receipts, are not affected.",
        ],
        button: "Unsubscribe",
      };
    case "unsubscribed":
      return {
        title: "You're unsubscribed",
        body: ["We won't send you marketing emails from " + name + " again.", ...after],
      };
    case "already":
      return {
        title: "You're already unsubscribed",
        body: ["We won't send you marketing emails from " + name + ".", ...after],
      };
    case "error":
      return {
        title: "Something went wrong",
        body: ["Please try again in a minute, or email " + PRIVACY_EMAIL + " and we'll take you off the list."],
      };
    default:
      return {
        title: "This link isn't valid",
        body: [
          "Please use the link exactly as it appears in your email.",
          "If you still get emails from us, write to " + PRIVACY_EMAIL + " and we'll take you off the list.",
        ],
      };
  }
}
