import { Flame } from 'lucide-react';

const EMBERS = [
  { bottom: '8%',  left: '7%',  s: 5, delay: '0s',   dur: '3.8s', dx: '14px'  },
  { bottom: '4%',  left: '18%', s: 3, delay: '0.7s', dur: '4.4s', dx: '-9px'  },
  { bottom: '14%', left: '32%', s: 4, delay: '1.4s', dur: '3.6s', dx: '20px'  },
  { bottom: '6%',  left: '50%', s: 6, delay: '0.3s', dur: '5.1s', dx: '-15px' },
  { bottom: '11%', left: '68%', s: 3, delay: '2.1s', dur: '3.3s', dx: '11px'  },
  { bottom: '5%',  left: '80%', s: 5, delay: '1.0s', dur: '4.6s', dx: '-13px' },
  { bottom: '17%', left: '91%', s: 4, delay: '0.5s', dur: '4.0s', dx: '9px'   },
  { bottom: '3%',  left: '43%', s: 3, delay: '2.6s', dur: '4.9s', dx: '17px'  },
  { bottom: '19%', left: '13%', s: 6, delay: '3.0s', dur: '3.5s', dx: '-19px' },
  { bottom: '8%',  left: '60%', s: 4, delay: '1.7s', dur: '4.2s', dx: '13px'  },
  { bottom: '13%', left: '26%', s: 3, delay: '0.4s', dur: '5.3s', dx: '-7px'  },
  { bottom: '7%',  left: '74%', s: 5, delay: '2.9s', dur: '3.9s', dx: '15px'  },
  { bottom: '2%',  left: '88%', s: 3, delay: '1.3s', dur: '4.7s', dx: '-10px' },
  { bottom: '21%', left: '55%', s: 4, delay: '0.9s', dur: '3.4s', dx: '8px'   },
  { bottom: '10%', left: '38%', s: 5, delay: '3.5s', dur: '5.0s', dx: '-12px' },
];

export default function MascPromoBanner() {
  return (
    <div className="masc-promo-wrap">

      {/* blobs */}
      <div className="masc-promo-blob" style={{
        width: 320, height: 320,
        background: 'rgba(196,154,108,0.10)',
        top: -90, left: -70,
        animation: 'promo-blob-drift 11s ease-in-out infinite',
      }} />
      <div className="masc-promo-blob" style={{
        width: 260, height: 260,
        background: 'rgba(61,27,15,0.60)',
        bottom: -80, right: -50,
        animation: 'promo-blob-drift2 14s ease-in-out infinite',
      }} />
      <div className="masc-promo-blob" style={{
        width: 190, height: 190,
        background: 'rgba(160,100,40,0.08)',
        top: '35%', left: '42%',
        animation: 'promo-blob-drift 17s ease-in-out infinite reverse',
      }} />

      {/* embers */}
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="masc-promo-ember"
          style={{
            bottom: e.bottom,
            left: e.left,
            width: e.s,
            height: e.s,
            background: i % 3 === 0
              ? 'rgba(255,175,50,0.92)'
              : i % 3 === 1
              ? 'rgba(196,154,108,0.88)'
              : 'rgba(255,215,100,0.78)',
            boxShadow: i % 2 === 0
              ? `0 0 ${e.s * 2}px rgba(255,175,50,0.6)`
              : `0 0 ${e.s * 2}px rgba(196,154,108,0.5)`,
            animationDelay: e.delay,
            animationDuration: e.dur,
            '--ex': e.dx,
          } as React.CSSProperties}
        />
      ))}

      {/* shimmer sweep */}
      <div className="masc-promo-shimmer" />

      {/* grid line overlay */}
      <div className="masc-promo-grid" />

      {/* content */}
      <div className="masc-promo-content">
        <div className="masc-promo-badge">
          <Flame size={12} />
          <span>PROMOÇÕES ESPECIAIS</span>
        </div>

        <h2 className="masc-promo-headline">
          Ofertas Exclusivas
        </h2>

        <p className="masc-promo-sub">
          Perfumes e produtos selecionados — para quem sabe o que quer
        </p>

        <div className="masc-promo-line">
          <span className="masc-promo-dot" />
          <span className="masc-promo-bar" />
          <span className="masc-promo-dot" style={{ animationDelay: '0.6s' }} />
          <span className="masc-promo-bar" />
          <span className="masc-promo-dot" style={{ animationDelay: '1.2s' }} />
        </div>
      </div>
    </div>
  );
}
