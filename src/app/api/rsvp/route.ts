import { NextResponse, after } from 'next/server';
import { revalidateTag } from 'next/cache';

// Google Apps Script web app bound to the RSVP sheet (see apps-script/Code.gs)
const SCRIPT_URL = process.env.RSVP_SCRIPT_URL;
const SCRIPT_SECRET = process.env.RSVP_SECRET;

// Apps Script takes several seconds per call, so lookups match against a cached copy of the
// guest list instead. It refreshes in the background every GUESTS_TTL seconds and after each
// RSVP update, so guests are never kept waiting on the refresh.
const GUESTS_TAG = 'rsvp-guests';
const GUESTS_TTL = 60;

type Guest = Record<string, string | number> & { row_number: number };

// Comparable form of a name: lowercase, no accents, words sorted (mirrors nameKey_ in Code.gs)
const nameKey = (name: unknown) =>
  String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');

async function getCachedGuests(): Promise<Guest[] | null> {
  try {
    const url = `${SCRIPT_URL}?action=list&secret=${encodeURIComponent(SCRIPT_SECRET ?? '')}`;
    const response = await fetch(url, {
      cache: 'force-cache',
      next: { revalidate: GUESTS_TTL, tags: [GUESTS_TAG] },
    });
    const data = await response.json().catch(() => null);
    return Array.isArray(data?.guests) ? data.guests : null;
  } catch (error) {
    console.error('[RSVP API] Guest list fetch failed:', error);
    return null;
  }
}

// Last good list this server instance has seen, so a slow refresh never keeps a guest waiting
let lastGuests: Guest[] | null = null;
const SLOW_REFRESH_MS = 1500;

async function getGuests(): Promise<Guest[] | null> {
  const fresh = getCachedGuests().then((guests) => {
    if (guests) lastGuests = guests;
    return guests;
  });
  if (!lastGuests) return fresh;

  const slow = new Promise<null>((resolve) => setTimeout(() => resolve(null), SLOW_REFRESH_MS));
  const guests = await Promise.race([fresh, slow]);
  if (guests) return guests;

  // Refresh is taking a while: answer from memory and let it finish in the background
  after(() => fresh);
  return lastGuests;
}

// Same response shape the Apps Script lookup (and n8n before it) returned
function findMatches(guests: Guest[], fullName: string) {
  const target = nameKey(fullName);
  return guests
    .filter((g) => target === nameKey(g['Guest name']) || target === nameKey(g['Name of other guest']))
    .map((guest) => ({
      found: true,
      guest,
      displayName: guest['Name of other guest']
        ? `${guest['Guest name']} & ${guest['Name of other guest']}`
        : guest['Guest name'],
    }));
}

// Sends the request straight to Apps Script (updates, and lookups when the cache is unavailable)
async function relayToScript(body: unknown) {
  // Apps Script answers with a redirect to the actual response; fetch follows it
  const response = await fetch(SCRIPT_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...(body as object), secret: SCRIPT_SECRET }),
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

  // Apps Script always returns 200, so failures arrive as { error } in the body
  const ok = response.ok && !!responseData && typeof responseData === 'object' && !responseData.error;
  return { ok, data: responseData };
}

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

    if (body.action !== 'update') {
      const guests = await getGuests();
      if (guests) {
        return NextResponse.json({ success: true, data: { matches: findMatches(guests, fullName) } });
      }
      console.warn('[RSVP API] Guest list unavailable, falling back to a direct lookup');
    }

    console.log(`[RSVP API] Relaying payload to Apps Script:`, body);
    const result = await relayToScript(body);

    // No error text goes to the client, so it shows its own translated fallback message
    if (!result.ok) {
      return NextResponse.json({ success: false }, { status: 502 });
    }

    // Refresh the cached list so returning guests see their new answers. The refetch runs after
    // this response is sent, so neither this guest nor the next one waits on Apps Script.
    if (body.action === 'update') {
      revalidateTag(GUESTS_TAG, 'max');
      after(() => getCachedGuests());
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('[RSVP API] Server-side error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
