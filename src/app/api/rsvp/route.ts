import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName } = body;

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    console.log(`[RSVP API] Submitting full name to n8n: ${fullName}`);

    const response = await fetch(
      'https://n8n.giangle.site/webhook-test/087c1999-f3fb-4b16-93bd-12f06bd371df',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName }),
      }
    );

    console.log(`[RSVP API] n8n response status: ${response.status}`);

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorText = await response.text();
      console.error(`[RSVP API] n8n error response: ${errorText}`);
      return NextResponse.json(
        { error: `Webhook error: ${response.status}` },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('[RSVP API] Server-side error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
