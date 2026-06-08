'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang } from '@/hooks/useLang';
import { COPY, FLASHBACK_IMAGES } from '@/lib/constants';

type Phase = 'idle' | 'sketching' | 'revealing' | 'morphing' | 'flashback' | 'done';

const CREAM = '#EDE7DA';
const GRID_COLS = 20;
const GRID_ROWS = 30;
// Threshold is % of full viewport cells touched. Kept low because the centered
// sketch image only occupies ~20-25% of a desktop viewport — once the user has
// scratched roughly over the image, that should be enough to advance.
const REVEAL_THRESHOLD = 0.22;
// Hard fallback: if user has actively drawn for this long, advance regardless.
const MAX_DRAW_MS = 6000;
const BRUSH_RADIUS_DESKTOP = 40;
const BRUSH_RADIUS_TOUCH = 52;

interface EntranceProps {
  onDone: () => void;
}

export default function Entrance({ onDone }: EntranceProps) {
  const { lang } = useLang();
  const copy = COPY[lang].entrance;

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const touchedCellsRef = useRef<Set<number>>(new Set());
  const cellSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const isTouchRef = useRef(false);
  const drawStartRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [hintVisible, setHintVisible] = useState(true);
  const [flashIndex, setFlashIndex] = useState(0);

  // ---- Canvas setup ----
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, w, h);
    ctxRef.current = ctx;
    cellSizeRef.current = { w: w / GRID_COLS, h: h / GRID_ROWS };
  }, []);

  useEffect(() => {
    setupCanvas();
    const onResize = () => {
      // Preserve drawn state by re-erasing all touched cells
      setupCanvas();
      const ctx = ctxRef.current;
      if (!ctx) return;
      const { w: cw, h: ch } = cellSizeRef.current;
      ctx.globalCompositeOperation = 'destination-out';
      touchedCellsRef.current.forEach((idx) => {
        const col = idx % GRID_COLS;
        const row = Math.floor(idx / GRID_COLS);
        ctx.beginPath();
        ctx.arc(col * cw + cw / 2, row * ch + ch / 2, Math.max(cw, ch) * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    };
    window.addEventListener('resize', onResize);
    document.body.classList.add('entrance-locked');
    return () => {
      window.removeEventListener('resize', onResize);
      document.body.classList.remove('entrance-locked');
    };
  }, [setupCanvas]);

  // ---- Pointer handlers ----
  const eraseAt = (x: number, y: number, fromX: number | null, fromY: number | null) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const radius = isTouchRef.current ? BRUSH_RADIUS_TOUCH : BRUSH_RADIUS_DESKTOP;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = radius * 2;
    ctx.strokeStyle = '#000';
    if (fromX !== null && fromY !== null) {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Track touched cells along the segment
    const { w: cw, h: ch } = cellSizeRef.current;
    const steps = fromX !== null && fromY !== null
      ? Math.max(1, Math.ceil(Math.hypot(x - fromX, y - fromY) / Math.min(cw, ch)))
      : 1;
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const px = fromX !== null ? fromX + (x - fromX) * t : x;
      const py = fromY !== null ? fromY + (y - fromY) * t : y;
      const col = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(px / cw)));
      const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(py / ch)));
      touchedCellsRef.current.add(row * GRID_COLS + col);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== 'idle' && phase !== 'sketching') return;
    isTouchRef.current = e.pointerType === 'touch';
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (hintVisible) setHintVisible(false);
    if (phase === 'idle') setPhase('sketching');
    if (drawStartRef.current === null) drawStartRef.current = performance.now();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    eraseAt(x, y, null, null);
    lastPtRef.current = { x, y };
    checkThreshold();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (phase !== 'sketching') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const last = lastPtRef.current;
    eraseAt(x, y, last?.x ?? null, last?.y ?? null);
    lastPtRef.current = { x, y };
    checkThreshold();
  };

  const onPointerUp = () => {
    lastPtRef.current = null;
  };

  const checkThreshold = () => {
    if (phase !== 'sketching' && phase !== 'idle') return;
    const ratio = touchedCellsRef.current.size / (GRID_COLS * GRID_ROWS);
    const elapsed = drawStartRef.current ? performance.now() - drawStartRef.current : 0;
    if (ratio >= REVEAL_THRESHOLD || elapsed >= MAX_DRAW_MS) {
      setPhase('revealing');
    }
  };

  // Phase transitions
  useEffect(() => {
    if (phase === 'sketching') {
      // Poll threshold even when pointer is idle, so the time fallback fires
      // and we don't depend purely on pointermove events.
      const id = window.setInterval(() => {
        const ratio = touchedCellsRef.current.size / (GRID_COLS * GRID_ROWS);
        const elapsed = drawStartRef.current ? performance.now() - drawStartRef.current : 0;
        if (ratio >= REVEAL_THRESHOLD || elapsed >= MAX_DRAW_MS) {
          setPhase('revealing');
        }
      }, 350);
      return () => window.clearInterval(id);
    }

    if (phase === 'revealing') {
      // Fade remaining cream away to fully reveal sketch
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.style.transition = 'opacity 900ms var(--ease-out-quart)';
      requestAnimationFrame(() => {
        canvas.style.opacity = '0';
      });
      const t = setTimeout(() => setPhase('morphing'), 950);
      return () => clearTimeout(t);
    }

    if (phase === 'morphing') {
      // Hold sketch, then crossfade to bench photo (handled in JSX)
      const t = setTimeout(() => setPhase('flashback'), 1400);
      return () => clearTimeout(t);
    }

    if (phase === 'flashback') {
      // Cycle through moments with variable timing
      let i = 0;
      let timeoutId: ReturnType<typeof setTimeout>;
      setFlashIndex(0);

      const next = () => {
        i++;
        if (i >= FLASHBACK_IMAGES.length) {
          setPhase('done');
        } else {
          setFlashIndex(i);
          const isLast = i === FLASHBACK_IMAGES.length - 1;
          const delay = isLast ? 1400 : 350;
          timeoutId = setTimeout(next, delay);
        }
      };

      timeoutId = setTimeout(next, 350);

      return () => clearTimeout(timeoutId);
    }

    if (phase === 'done') {
      const root = rootRef.current;
      if (!root) return;
      root.style.transition = 'opacity 1100ms var(--ease-out-quart), transform 1200ms var(--ease-out-quart), filter 1100ms var(--ease-out-quart)';
      requestAnimationFrame(() => {
        root.style.opacity = '0';
        root.style.transform = 'scale(1.1)';
        root.style.filter = 'blur(10px)';
      });
      const t = setTimeout(() => onDone(), 1100);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  // Allow keyboard skip (dev convenience) — press Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPhase('done');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-hidden no-select"
      style={{ background: CREAM }}
      aria-label="Sketch entrance"
    >
      {/* Layer 1: Sketch portrait (image 1) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: phase === 'morphing' || phase === 'flashback' || phase === 'done' ? 0 : 1,
          transition: 'opacity 900ms var(--ease-smooth)',
        }}
      >
        <img
          src="/images/sketch-portrait.webp"
          alt=""
          className="max-h-[78vh] max-w-[88vw] aspect-[1023/1537] object-cover"
          draggable={false}
        />
      </div>

      {/* Layer 2: Real bench photo (image 9) — appears during morph */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: phase === 'morphing' ? 1 : phase === 'flashback' ? 0 : 0,
          transition: 'opacity 1000ms var(--ease-smooth)',
        }}
      >
        <img
          src="/images/bench-portrait.webp"
          alt=""
          className="max-h-[78vh] max-w-[88vw] aspect-[1023/1537] object-cover"
          draggable={false}
        />
      </div>

      {/* Layer 3: Flashback images stacked, only active during flashback phase */}
      <div className="absolute inset-0 pointer-events-none">
        {FLASHBACK_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: phase === 'flashback' && flashIndex === i ? 1 : 0,
              transition: 'opacity 140ms linear',
            }}
          >
            <img
              src={src}
              alt=""
              className={`max-h-[78vh] max-w-[88vw] aspect-[1023/1537] object-cover ${
                src.includes('moment-06-street.webp') ? 'object-[60%_center]' :
                src.includes('moment-07-ring') ? 'object-[75%_center]' :
                'object-center'
              }`}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Layer 4: Canvas (cream overlay user erases) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none' }}
      />

      {/* Layer 5: Hint overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
        style={{
          opacity: hintVisible && phase === 'idle' ? 1 : 0,
          transition: 'opacity 500ms var(--ease-smooth)',
        }}
      >
        <img
          src="/images/logo.png"
          alt="T & T Logo"
          className="w-16 h-16 md:w-20 md:h-20 object-contain mix-blend-multiply mb-6 md:mb-8"
          draggable={false}
        />
        <SketchHand />
        <p
          className="mt-8 font-display italic text-ink/85 text-[clamp(1.4rem,4.5vw,2.25rem)] tracking-wide text-center"
          style={{ animation: 'breathe 2.8s ease-in-out infinite' }}
        >
          {copy.hint}
        </p>
        <p className="mt-3 font-body text-[11px] md:text-xs tracking-[0.3em] uppercase text-ink-muted">
          {copy.whisper}
        </p>
      </div>

      {/* Layer 6: Subtle progress hint at corner once user starts */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          opacity: phase === 'sketching' ? 0.4 : 0,
          transition: 'opacity 400ms var(--ease-smooth)',
        }}
      >
        <span className="font-body text-[10px] tracking-[0.4em] uppercase text-ink-muted">
          {lang === 'en' ? 'keep going' : 'tiếp tục vẽ'}
        </span>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.6; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-6px) rotate(-4deg); }
        }
      `}</style>
    </div>
  );
}

function SketchHand() {
  // Minimal hand-drawn pencil + squiggle, in ink color
  return (
    <svg
      width="78"
      height="78"
      viewBox="0 0 78 78"
      fill="none"
      style={{ animation: 'float 2.8s ease-in-out infinite' }}
      aria-hidden
    >
      {/* Pencil body */}
      <path
        d="M50 12 L62 24 L26 60 L14 64 L18 52 Z"
        stroke="#1F1B17"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Pencil tip */}
      <path d="M14 64 L20 58" stroke="#1F1B17" strokeWidth="1.4" strokeLinecap="round" />
      {/* Eraser end */}
      <path d="M50 12 L54 8 L66 20 L62 24" stroke="#1F1B17" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      {/* Sketch squiggle */}
      <path
        d="M28 70 Q34 66 38 70 T48 70 T58 70"
        stroke="#1F1B17"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
