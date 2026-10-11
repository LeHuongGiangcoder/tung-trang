// Small hand-drawn-style line icons in the site's ink, used beside section headings.
// Each heading pair has a dotted path on its outer side so they read as a set.
const inkStroke = { stroke: '#1F1B17', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

const headingIconClass = 'w-11 md:w-14 h-auto opacity-75 -mb-1';

// Two interlocking rings, one with a stone, and a little sparkle: the vows
export function Rings() {
  return (
    <svg width="56" height="34" viewBox="0 0 56 34" className={headingIconClass} aria-hidden>
      <path d="M2 27 C 6 24, 9 30, 13 26" {...inkStroke} strokeDasharray="1.5 3.5" />
      <path d="M11 9 l0.9 2.6 l2.6 0.9 l-2.6 0.9 l-0.9 2.6 l-0.9 -2.6 l-2.6 -0.9 l2.6 -0.9 z" {...inkStroke} strokeWidth={0.9} />
      <circle cx="27" cy="21" r="8" {...inkStroke} />
      <circle cx="38" cy="19" r="8" {...inkStroke} />
      <path d="M35.5 8.6 L38 5.5 L40.5 8.6 L38 11 Z" {...inkStroke} />
    </svg>
  );
}

// Two champagne flutes clinking, with a dotted path: the party
export function Flutes() {
  return (
    <svg width="56" height="34" viewBox="0 0 56 34" className={headingIconClass} aria-hidden>
      <g transform="rotate(14 20 18)">
        <path d="M16 5 L24 5 L23 15 Q20 19 17 15 Z" {...inkStroke} />
        <path d="M16.6 10 L23.4 10" {...inkStroke} strokeWidth={0.8} opacity={0.6} />
        <path d="M20 18 L20 28 M16.5 28 L23.5 28" {...inkStroke} />
      </g>
      <g transform="rotate(-14 34 18)">
        <path d="M30 5 L38 5 L37 15 Q34 19 31 15 Z" {...inkStroke} />
        <path d="M30.6 10 L37.4 10" {...inkStroke} strokeWidth={0.8} opacity={0.6} />
        <path d="M34 18 L34 28 M30.5 28 L37.5 28" {...inkStroke} />
      </g>
      <path d="M27 0.8 L27 3 M23.8 2 L25 3.6 M30.2 2 L29 3.6" {...inkStroke} strokeWidth={0.9} />
      <path d="M43 26 C 47 30, 50 24, 54 27" {...inkStroke} strokeDasharray="1.5 3.5" />
    </svg>
  );
}

// Paper plane on a dotted flight path, flying in toward the heading
export function PaperPlane() {
  return (
    <svg width="56" height="34" viewBox="0 0 56 34" className={headingIconClass} aria-hidden>
      <path d="M3 28 C 10 30, 14 18, 22 21 S 31 27, 35 19" {...inkStroke} strokeDasharray="1.5 3.5" />
      <path d="M36 15 L53 6 L47 26 L43 18 Z" {...inkStroke} />
      <path d="M43 18 L53 6" {...inkStroke} />
      <path d="M43 18 L42 23 L45.5 20.5" {...inkStroke} />
    </svg>
  );
}

// Map pin with a dotted path arriving at it: the destination
export function MapPin() {
  return (
    <svg width="56" height="34" viewBox="0 0 56 34" className={headingIconClass} aria-hidden>
      <path d="M2 22 C 8 17, 13 27, 20 23" {...inkStroke} strokeDasharray="1.5 3.5" />
      <path d="M33 4 a8 8 0 0 1 8 8 c0 6 -8 15 -8 15 s-8 -9 -8 -15 a8 8 0 0 1 8 -8 z" {...inkStroke} />
      <circle cx="33" cy="12" r="2.6" {...inkStroke} />
      <path d="M24 30.5 Q33 33 42 30.5" {...inkStroke} />
    </svg>
  );
}

// Nón lá (conical hat), standing in for Vietnam the way the bow sketch stands in for Dresscode
export function NonLa() {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" className="w-16 h-auto opacity-80" aria-hidden>
      <path d="M5 28 L36 4 L67 28" {...inkStroke} />
      <path d="M5 28 Q36 37 67 28" {...inkStroke} />
      {/* Woven rings around the cone */}
      <path d="M14.7 20.5 Q36 27 57.3 20.5 M24.4 13 Q36 17.5 47.6 13" {...inkStroke} strokeWidth={0.9} opacity={0.6} />
      <path d="M17 31 Q36 46 55 31" {...inkStroke} strokeDasharray="1.5 3" opacity={0.7} />
    </svg>
  );
}
