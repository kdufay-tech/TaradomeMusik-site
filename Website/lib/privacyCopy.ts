/* ─── Copy for the /confirm and /unsubscribe pages (TEOS privacy phase 1) ───
 * One place, so the text the owner approves is exactly the text the pages render. Shown in full in
 * the TEOS report task-p1-report.md for approval before this ships. {name} is the artist (or the
 * label) the email came from.
 */

export const PRIVACY_EMAIL = "privacy@taradomemusik.com";

/* ─── Fan age check (TEOS, 2026-11-27): the privacy notice's children section ───
 * DRAFT for Kiszo's approval and Michael Olowo Aturu's review (TEOS docs/privacy/2026-11-27-age-check-copy.md).
 * PRIVACY_NOTICE_VERSION must equal POLICY_VERSION in TEOS apps/api/src/modules/privacy/privacy.config.ts: TEOS records
 * every consent under that version. */
export const PRIVACY_NOTICE_VERSION = "fan-notice-2026-11-27";
export const CHILDREN_HEADING = "Children and teenagers";
export const CHILDREN_BODY =
  "You must be 13 or older to sign up. If you are 13 to 17, we ask for your parent's or guardian's email and send you nothing until they agree. " +
  "One agreement covers every TáraDomeMusik artist. Your parent can withdraw it at any time with the link in their confirmation email, and we then delete your details. " +
  "If your parent declines, or does not answer within 7 days, we delete your details. We never use the details of anyone under 18 for advertising. " +
  "If you think a child under 13 has given us their details, write to " + PRIVACY_EMAIL + " and we will delete them.";

export type Copy = { title: string; body: string[]; button?: string };

export function confirmCopy(state: string, name: string): Copy {
  switch (state) {
    case "valid":
      return {
        title: "Confirm you want news from " + name,
        body: [
          "Click the button to start getting news from " + name + " by email: new music, shows and offers, and relevant ads on social media.",
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
    // Fan age check (TEOS V617): a 13-17 fan's confirmation waits for their parent; the link keeps working until then.
    case "guardian_pending":
      return {
        title: "We're waiting for your parent or guardian",
        body: [
          "Thanks for confirming your email. Because you're 13 to 17, we need your parent or guardian to agree first.",
          "Once they do, open this link again and we'll start sending you news from " + name + ".",
        ],
      };
    case "age_needed":
      return {
        title: "Please tell us your age first",
        body: ["Sign up again on taradomemusik.com and answer the age question, then confirm from your inbox."],
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
