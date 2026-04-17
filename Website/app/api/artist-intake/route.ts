import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/artist-intake
 * Body: { name, email, location?, links[], genre?, message?, consent:true }
 *
 * Wire to CRM pipeline: Artist Submissions -> A&R queue -> stagecraft development.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.email) {
    return NextResponse.json({ ok: false, error: "name_and_email_required" }, { status: 400 });
  }

  // TODO: Create lead/prospect in CRM + notify A&R.
  return NextResponse.json({ ok: true });
}
