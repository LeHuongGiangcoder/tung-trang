import { NextResponse } from 'next/server';

// Google Apps Script web app bound to the RSVP sheet (see apps-script/Code.gs)
const SCRIPT_URL = process.env.RSVP_SCRIPT_URL;
const SCRIPT_SECRET = process.env.RSVP_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = body.fullName || body['Guest name'];

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!SCRIPT_URL) {
      console.error('[RSVP API] RSVP_SCRIPT_URL is not set');
      return NextResponse.json({ success: false }, { status: 500 });
    }

    console.log(`[RSVP API] Relaying payload to Apps Script:`, body);

    // Apps Script answers with a redirect to the actual response; fetch follows it
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, secret: SCRIPT_SECRET }),
      redirect: 'follow',
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData: any = null;
    if (contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      responseData = await response.text().catch(() => '');
    }

    console.log(`[RSVP API] Apps Script response status: ${response.status}`);
    console.log(`[RSVP API] Apps Script response payload:`, responseData);

    // Apps Script always returns 200, so failures arrive as { error } in the body.
    // No error text goes to the client, so it shows its own translated fallback message.
    if (!response.ok || !responseData || typeof responseData !== 'object' || responseData.error) {
      return NextResponse.json({ success: false }, { status: 502 });
    }

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('[RSVP API] Server-side error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
