import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, MessageCircle, Star,
  Droplets, Wind, Scissors, Flower2, FlameKindling, Paintbrush2,
  ChevronRight, Heart, Zap,
} from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import api from '../services/api';

const CATEGORIES = [
  { slug: 'maquiagem', label: 'Maquiagem',  Icon: Paintbrush2,   color: '#5C2040', bg: 'rgba(92,32,64,0.06)',   border: 'rgba(92,32,64,0.14)'  },
  { slug: 'skincare',  label: 'Skincare',   Icon: Droplets,      color: '#7A5C3A', bg: 'rgba(122,92,58,0.06)',  border: 'rgba(122,92,58,0.14)' },
  { slug: 'cabelo',    label: 'Cabelo',     Icon: Scissors,      color: '#3D1225', bg: 'rgba(61,18,37,0.06)',   border: 'rgba(61,18,37,0.14)'  },
  { slug: 'perfumes',  label: 'Perfumes',   Icon: Wind,          color: '#6B3D5C', bg: 'rgba(107,61,92,0.06)',  border: 'rgba(107,61,92,0.14)' },
  { slug: 'corpo',     label: 'Corpo',      Icon: Flower2,       color: '#A07845', bg: 'rgba(160,120,69,0.06)', border: 'rgba(160,120,69,0.14)' },
  { slug: 'unhas',     label: 'Unhas',      Icon: FlameKindling, color: '#7A2A1A', bg: 'rgba(122,42,26,0.06)',  border: 'rgba(122,42,26,0.14)' },
];

const TRUST = [
  { Icon: Shield,        text: 'Produtos 100% originais' },
  { Icon: Zap,           text: 'Entrega rápida e segura'  },
  { Icon: MessageCircle, text: 'Atendimento via WhatsApp'  },
  { Icon: Star,          text: 'As melhores marcas'        },
];

const PETALS = [
  { left: '6%',  delay: 0,   dur: 8,  size: 8,  pdx:  12, prot:  30, color: 'rgba(196,154,108,0.20)'  },
  { left: '20%', delay: 1.5, dur: 9,  size: 6,  pdx: -10, prot: -22, color: 'rgba(61,18,37,0.15)'     },
  { left: '38%', delay: 2.8, dur: 10, size: 9,  pdx:  16, prot:  48, color: 'rgba(196,154,108,0.18)'  },
  { left: '56%', delay: 0.9, dur: 8,  size: 7,  pdx: -13, prot: -38, color: 'rgba(92,32,64,0.14)'     },
  { left: '74%', delay: 2.1, dur: 11, size: 8,  pdx:  11, prot:  33, color: 'rgba(196,154,108,0.16)'  },
  { left: '90%', delay: 3.5, dur: 9,  size: 6,  pdx: -10, prot: -18, color: 'rgba(61,18,37,0.12)'     },
];

export default function Home() {
  const [featured, setFeatured]   = useState<Product[]>([]);
  const [storeName, setStoreName] = useState('Denize Off');
  const [banner, setBanner]       = useState<string | null>(null);
  const [brands, setBrands]       = useState<string[]>([]);
  const [hasPromo, setHasPromo]   = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=6&gender=feminino&sort=price_normal&dir=desc'),
      api.get('/products?limit=2&gender=misto&sort=price_normal&dir=desc'),
      api.get('/products/brands?gender=feminino'),
    ]).then(([femR, mistoR, brandsR]) => {
      const all = [...femR.data.products, ...mistoR.data.products];
      setFeatured(all);
      setBrands(brandsR.data.brands);
      setHasPromo(all.some((p: Product) => p.price_promotion));
    });
    api.get('/config').then(r => {
      if (r.data.store_name) setStoreName(r.data.store_name);
      if (r.data.banner_url) setBanner(r.data.banner_url);
    });
  }, []);

  useEffect(() => {
    if (!featured.length || !gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll<HTMLElement>('.card-reveal'));
    if (!window.IntersectionObserver) {
      cards.forEach(c => c.classList.add('in-view'));
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            (target as HTMLElement).classList.add('in-view');
            obs.unobserve(target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, [featured]);

  return (
    <main style={{ background: '#FAF6F1' }}>

      {/* ════════════════════════════════════
          HERO — Editorial Luxo
          Ivory warm mesh, typographic focus
      ════════════════════════════════════ */}
      <section className="fem-hero min-h-[600px] sm:min-h-[640px] flex items-center">

        {banner && (
          <img
            src={banner} alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.04, zIndex: 1, mixBlendMode: 'multiply' }}
          />
        )}

        {PETALS.map((p, i) => (
          <div key={i} className="fem-petal" style={{
            width: p.size, height: p.size,
            bottom: 24, left: p.left,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--pdx': `${p.pdx}px`,
            '--prot': `${p.prot}deg`,
            zIndex: 2,
          } as React.CSSProperties} />
        ))}

        <div className="fem-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
          <div className="max-w-xl" style={{ animation: 'fem-fade-up 0.6s ease-out both' }}>

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(196,154,108,0.10)',
                border: '1px solid rgba(196,154,108,0.30)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#C49A6C' }} />
              <span className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: '#A07845' }}>
                Coleção Feminina
              </span>
            </div>

            {/* Store name — Cormorant Garamond, editorial */}
            <h1
              className="font-display leading-[1.05] mb-3"
              style={{
                fontSize: 'clamp(3rem, 7.5vw, 5rem)',
                color: '#1A0A10',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              {storeName}
            </h1>

            {/* Tagline — italic copper shimmer */}
            <p
              className="font-display italic fem-shimmer-text mb-5"
              style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.4rem)', fontWeight: 400 }}
            >
              Sua beleza. Nossa paixão.
            </p>

            <p
              className="text-base sm:text-lg mb-9 leading-relaxed max-w-md"
              style={{ color: '#5C3845', fontWeight: 400 }}
            >
              Produtos selecionados com carinho para realçar o que você já tem de mais bonito.
              Qualidade premium, preços que cabem no bolso.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/produtos?gender=feminino"
                className="btn-hero-primary inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm select-none cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #5C2040 0%, #3D1225 100%)',
                  color: '#FAF6F1',
                  boxShadow: '0 4px 20px rgba(61,18,37,0.28)',
                }}
              >
                Ver Coleção <ArrowRight size={16} />
              </Link>
              <Link
                to="/produtos?promo=true&gender=feminino"
                className="btn-hero-promo inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold select-none cursor-pointer"
                style={{
                  border: '1.5px solid rgba(196,154,108,0.45)',
                  color: '#A07845',
                  background: 'rgba(196,154,108,0.06)',
                }}
              >
                <Heart size={14} />
                Ver Promoções
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════ */}
      <section style={{ background: '#F5EFE9', borderBottom: '1px solid rgba(61,18,37,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {TRUST.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs font-medium py-1"
                style={{ color: '#8C7378' }}>
                <Icon size={13} style={{ color: '#C49A6C', flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          PROMO BANNER
      ════════════════════════════════════ */}
      {hasPromo && (
        <section className="pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <PromoBanner />
        </section>
      )}

      {/* ════════════════════════════════════
          CATEGORIES
      ════════════════════════════════════ */}
      <section className="py-14" style={{ background: '#FAF6F1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
              style={{ color: '#C49A6C' }}>Explore</p>
            <h2 className="font-display text-3xl"
              style={{ color: '#1A0A10', fontWeight: 600 }}>Categorias</h2>
            <p className="mt-2 text-sm" style={{ color: '#8C7378' }}>Encontre o que você precisa</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORIES.map(({ slug, label, Icon, color, bg, border }) => (
              <Link
                key={slug}
                to={`/produtos?category=${slug}&gender=feminino`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-250 cursor-pointer"
                style={{ background: bg, borderColor: border }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${color}18`;
                  (e.currentTarget as HTMLElement).style.borderColor = color + '45';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.borderColor = border;
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-250 group-hover:scale-110"
                  style={{ background: color + '14' }}
                >
                  <Icon size={19} style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-center leading-tight" style={{ color }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          BRANDS
      ════════════════════════════════════ */}
      {brands.length > 0 && (
        <section className="py-12" style={{ background: 'white' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
                style={{ color: '#C49A6C' }}>Parceiros</p>
              <h2 className="font-display text-2xl" style={{ color: '#1A0A10', fontWeight: 600 }}>
                Nossas Marcas
              </h2>
              <p className="mt-1.5 text-sm" style={{ color: '#8C7378' }}>
                Marcas que você conhece e confia
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {brands.map(brand => (
                <Link
                  key={brand}
                  to={`/produtos?brand=${encodeURIComponent(brand)}&gender=feminino`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 select-none cursor-pointer"
                  style={{
                    background: 'rgba(196,154,108,0.07)',
                    border: '1px solid rgba(196,154,108,0.20)',
                    color: '#3D1225',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,108,0.14)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,154,108,0.50)';
                    (e.currentTarget as HTMLElement).style.color = '#A07845';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,108,0.07)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,154,108,0.20)';
                    (e.currentTarget as HTMLElement).style.color = '#3D1225';
                  }}
                >
                  {brand}
                </Link>
              ))}
              <Link
                to="/produtos?gender=feminino"
                className="px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-1.5 select-none cursor-pointer transition-all"
                style={{
                  background: 'linear-gradient(135deg, #5C2040, #3D1225)',
                  color: '#FAF6F1',
                  boxShadow: '0 3px 12px rgba(61,18,37,0.25)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}
              >
                Ver todos <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════ */}
      <section className="py-14" style={{ background: brands.length > 0 ? '#FAF6F1' : 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1"
                style={{ color: '#C49A6C' }}>Coleção</p>
              <h2 className="font-display text-3xl" style={{ color: '#1A0A10', fontWeight: 600 }}>
                Destaques
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#8C7378' }}>
                Os favoritos das nossas clientes
              </p>
            </div>
            <Link
              to="/produtos?gender=feminino"
              className="flex items-center gap-1 text-sm font-semibold transition-colors select-none cursor-pointer"
              style={{ color: '#A07845' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#3D1225'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#A07845'}
            >
              Ver tudo <ChevronRight size={15} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                  style={{ background: '#F5EFE9', border: '1px solid rgba(61,18,37,0.06)' }}>
                  <div className="aspect-[4/5]" style={{ background: '#EFE3D8' }} />
                  <div className="p-4 space-y-2">
                    <div className="h-3 rounded-full w-1/3" style={{ background: '#EFE3D8' }} />
                    <div className="h-4 rounded-full w-4/5" style={{ background: '#EFE3D8' }} />
                    <div className="h-5 rounded-full w-1/2" style={{ background: '#EFE3D8' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p, i) => (
                <div
                  key={p.id}
                  className="card-reveal"
                  data-reveal={i % 2 === 0 ? 'left' : 'right'}
                  style={{ transitionDelay: `${i * 65}ms` }}
                >
                  <ProductCard product={p} theme="feminino" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA BOTTOM — deep burgundy editorial
      ════════════════════════════════════ */}
      <section className="fem-cta-section py-20">
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6"
            style={{ background: 'rgba(196,154,108,0.15)', border: '1px solid rgba(196,154,108,0.35)' }}
          >
            <span className="font-display font-bold text-lg" style={{ color: '#E8D5B7' }}>D</span>
          </div>
          <h2
            className="font-display font-bold mb-4 leading-tight text-white"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
          >
            Pronta para se sentir incrível?
          </h2>
          <p className="mb-8 text-base leading-relaxed" style={{ color: 'rgba(232,213,183,0.70)' }}>
            Explore nossa coleção completa e descubra o produto perfeito para cada momento do seu dia.
          </p>
          <Link
            to="/produtos?gender=feminino"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full transition-all text-sm select-none cursor-pointer"
            style={{
              background: 'rgba(196,154,108,0.15)',
              border: '1.5px solid rgba(196,154,108,0.50)',
              color: '#E8D5B7',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,108,0.25)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,108,0.15)';
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            Explorar Coleção <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
