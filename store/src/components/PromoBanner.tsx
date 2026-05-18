import { Tag } from 'lucide-react';

/* Floating particle descriptors — each gets its own position, size, delay, duration */
const PETALS = [
  { top: '12%',  left: '6%',   s: 22, delay: '0s',   dur: '5s',   rot: 30  },
  { top: '68%',  left: '10%',  s: 14, delay: '1.8s', dur: '6.5s', rot: 120 },
  { top: '22%',  left: '86%',  s: 18, delay: '0.6s', dur: '5.5s', rot: 60  },
  { top: '72%',  left: '80%',  s: 12, delay: '2.4s', dur: '4.8s', rot: 200 },
  { top: '48%',  left: '3%',   s: 10, delay: '3.2s', dur: '7s',   rot: 90  },
  { top: '15%',  left: '48%',  s: 9,  delay: '1.2s', dur: '5.2s', rot: 45  },
  { top: '82%',  left: '38%',  s: 16, delay: '2.8s', dur: '4.5s', rot: 150 },
  { top: '8%',   left: '72%',  s: 11, delay: '0.4s', dur: '6.8s', rot: 10  },
  { top: '58%',  left: '93%',  s: 13, delay: '1.6s', dur: '5.8s', rot: 300 },
  { top: '88%',  left: '18%',  s: 8,  delay: '3.8s', dur: '6s',   rot: 240 },
  { top: '35%',  left: '75%',  s: 20, delay: '0.9s', dur: '4.2s', rot: 70  },
  { top: '75%',  left: '58%',  s: 9,  delay: '4.2s', dur: '5s',   rot: 180 },
];

function PetalSvg({ size, rotate, opacity }: { size: number; rotate: number; opacity: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ opacity, transform: `rotate(${rotate}deg)` }}
    >
      {/* 4-petal flower */}
      <ellipse cx="12" cy="7"  rx="4"  ry="6"  fill="currentColor" />
      <ellipse cx="12" cy="17" rx="4"  ry="6"  fill="currentColor" />
      <ellipse cx="7"  cy="12" rx="6"  ry="4"  fill="currentColor" />
      <ellipse cx="17" cy="12" rx="6"  ry="4"  fill="currentColor" />
      <circle  cx="12" cy="12" r="3"   fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

function StarSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function PromoBanner() {
  return (
    <div className="promo-banner-wrap">

      {/* ── Animated background blobs ── */}
      <div className="promo-blob promo-blob-1" />
      <div className="promo-blob promo-blob-2" />
      <div className="promo-blob promo-blob-3" />

      {/* ── Floating petals ── */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="promo-particle"
          style={{
            top: p.top,
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.dur,
            color: i % 3 === 0
              ? 'rgba(255,255,255,0.55)'
              : i % 3 === 1
              ? 'rgba(255,220,240,0.65)'
              : 'rgba(255,195,220,0.50)',
          }}
        >
          {i % 4 === 0
            ? <StarSvg size={p.s * 0.7} />
            : <PetalSvg size={p.s} rotate={p.rot} opacity={1} />
          }
        </span>
      ))}

      {/* ── Gold shimmer overlay ── */}
      <div className="promo-shimmer" />

      {/* ── Main content ── */}
      <div className="promo-content">

        {/* badge */}
        <div className="promo-badge">
          <Tag size={11} />
          <span>OFERTAS ESPECIAIS</span>
        </div>

        {/* headline with metallic shimmer */}
        <h2 className="promo-headline">
          Em Promoção
        </h2>

        <p className="promo-sub">
          Produtos selecionados com descontos exclusivos para você
        </p>

        {/* animated sparkle line */}
        <div className="promo-line">
          <span className="promo-line-dot" />
          <span className="promo-line-bar" />
          <span className="promo-line-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
