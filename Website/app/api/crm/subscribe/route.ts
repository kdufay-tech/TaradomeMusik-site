import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/crm/subscribe
 * Body: { email, phone?, firstName?, lastName?, source, tags? }
 *
 * Wire this server-side to Modern Music CRM (or your chosen CRM) via API key + endpoint.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email) return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });

  // TODO: Replace with CRM API call (server-side).
  return NextResponse.json({ ok: true, received: body });
}
