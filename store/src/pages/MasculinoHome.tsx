import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wind, Droplets, Star, ChevronRight, Flame, Shield, MessageCircle } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import api from '../services/api';

const MASC_CATEGORIES = [
  { slug: 'perfumes', label: 'Perfumes',  Icon: Wind,     color: '#C49A6C', bg: 'rgba(196,154,108,0.08)',   border: 'rgba(196,154,108,0.2)'   },
  { slug: 'skincare', label: 'Skincare',  Icon: Droplets, color: '#78716C', bg: 'rgba(120,113,108,0.08)', border: 'rgba(120,113,108,0.2)' },
  { slug: 'cabelo',   label: 'Cabelo',    Icon: Flame,    color: '#B45309', bg: 'rgba(180,83,9,0.08)',    border: 'rgba(180,83,9,0.2)'    },
  { slug: 'corpo',    label: 'Corpo',     Icon: Shield,   color: '#57534E', bg: 'rgba(87,83,78,0.08)',    border: 'rgba(87,83,78,0.2)'    },
];

const TRUST = [
  { Icon: Shield,        text: 'Produtos originais garantidos' },
  { Icon: Flame,         text: 'Fragrâncias premium selecionadas' },
  { Icon: MessageCircle, text: 'Atendimento via WhatsApp' },
  { Icon: Star,          text: 'As melhores marcas masculinas' },
];

export default function MasculinoHome() {
  const [featured, setFeatured]   = useState<Product[]>([]);
  const [storeName, setStoreName] = useState('Beauty Store');
  const [banner, setBanner]       = useState<string | null>(null);
  const [brands, setBrands]       = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=6&gender=masculino&sort=price_normal&dir=desc'),
      api.get('/products?limit=2&gender=misto&sort=price_normal&dir=desc'),
      api.get('/products/brands?gender=masculino'),
    ]).then(([mascR, mistoR, brandsR]) => {
      const all = [...mascR.data.products, ...mistoR.data.products];
      setFeatured(all);
      setBrands(brandsR.data.brands);
    });
    api.get('/config').then(r => {
      if (r.data.store_name) setStoreName(r.data.store_name);
      if (r.data.banner_url) setBanner(r.data.banner_url);
    });
  }, []);

  useEffect(() => {
    if (!featured.length || !gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll<HTMLElement>('.card-reveal'));
    if (!cards.length) return;
    const reveal = (el: HTMLElement) => el.classList.add('in-view');
    const fallback = setTimeout(() => cards.forEach(reveal), 800);
    if (!window.IntersectionObserver) { cards.forEach(reveal); clearTimeout(fallback); return; }
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) { reveal(target as HTMLElement); obs.unobserve(target); }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px 60px 0px' }
    );
    cards.forEach(c => obs.observe(c));
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [featured]);

  return (
    <main style={{ background: '#1C1917' }}>

      {/* ════════════════════════════════════
          HERO — Dark luxury / wood & smoke
      ════════════════════════════════════ */}
      <section className="masc-hero relative min-h-[600px] flex items-center">
        {banner && (
          <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06] mix-blend-overlay" />
        )}

        {/* Smoke blobs */}
        <div className="masc-smoke-blob" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(87,83,78,0.4), transparent)', top: -80, right: -100, animation: 'smokeDrift 10s ease-in-out infinite' }} />
        <div className="masc-smoke-blob" style={{ width: 350, height: 350, background: 'radial-gradient(circle, rgba(61,43,31,0.6), transparent)', bottom: -60, left: -60, animation: 'smokeDrift2 13s ease-in-out infinite' }} />
        <div className="masc-smoke-blob" style={{ width: 250, height: 250, background: 'radial-gradient(circle, rgba(196,154,108,0.12), transparent)', top: '40%', left: '55%', animation: 'smokeDrift 8s ease-in-out infinite reverse' }} />

        {/* Smoke particles */}
        {[20, 35, 55, 70, 85].map((left, i) => (
          <div key={i} className="smoke-particle" style={{
            width: 60 + i * 20,
            height: 60 + i * 20,
            bottom: 20,
            left: `${left}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + i}s`,
            '--dx': `${(i % 2 === 0 ? 1 : -1) * (10 + i * 5)}px`,
          } as React.CSSProperties} />
        ))}

        {/* Content */}
        <div className="masc-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full">
          <div className="max-w-lg" style={{ animation: 'masc-fade-up 0.7s ease-out both' }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(196,154,108,0.1)', border: '1px solid rgba(196,154,108,0.3)', backdropFilter: 'blur(8px)' }}>
              <Flame size={12} style={{ color: '#C49A6C' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#C49A6C', fontFamily: "'Montserrat', sans-serif" }}>
                Coleção Masculina
              </span>
            </div>

            <h1 className="font-bold leading-[1.05] mb-3"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
                color: '#F5F0EB',
              }}>
              {storeName}
            </h1>

            <p className="mb-3 italic"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                fontWeight: 400,
                background: 'linear-gradient(90deg, #C49A6C, #FEF08A, #C49A6C)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'gold-shimmer 4s linear infinite',
              }}>
              Sua essência. Sua marca.
            </p>

            <p className="text-base mb-9 leading-relaxed" style={{ color: 'rgba(245,240,235,0.55)', fontFamily: "'Montserrat', sans-serif" }}>
              Fragrâncias e cuidados pensados para o homem que sabe o que quer. Qualidade que você sente, elegância que os outros percebem.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/masculino/produtos"
                className="btn-masc-gold !text-sm !px-7 !py-3.5">
                Ver Coleção <ArrowRight size={16} />
              </Link>
              <Link to="/masculino/promocoes"
                className="btn-masc-outline !text-sm !px-7 !py-3.5">
                <Flame size={15} />
                Promoções
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade to dark */}
        <div className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: 'linear-gradient(to bottom, transparent, #1C1917)' }} />
      </section>

      {/* ════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════ */}
      <section style={{ background: '#141210', borderBottom: '1px solid rgba(196,154,108,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {TRUST.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs font-medium py-1"
                style={{ color: '#57534E', fontFamily: "'Montserrat', sans-serif" }}>
                <Icon size={13} style={{ color: '#C49A6C', flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CATEGORIES
      ════════════════════════════════════ */}
      <section className="py-16 masc-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#C49A6C', fontFamily: "'Montserrat', sans-serif" }}>Explore</p>
            <h2 className="font-bold text-3xl mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#F5F0EB' }}>Categorias</h2>
            <p className="text-sm" style={{ color: '#57534E', fontFamily: "'Montserrat', sans-serif" }}>Encontre o produto certo para você</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MASC_CATEGORIES.map(({ slug, label, Icon, color, bg, border }) => (
              <Link
                key={slug}
                to={`/masculino/produtos?category=${slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 cursor-pointer"
                style={{ background: bg, border: `1px solid ${border}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = color; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = border; }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${color}1a` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <span className="text-sm font-semibold" style={{ color, fontFamily: "'Montserrat', sans-serif" }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          BRANDS
      ════════════════════════════════════ */}
      {brands.length > 0 && (
        <section className="py-12 masc-section-alt">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#C49A6C', fontFamily: "'Montserrat', sans-serif" }}>Marcas</p>
              <h2 className="font-bold text-2xl" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#F5F0EB' }}>Nossos Parceiros</h2>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {brands.map(brand => (
                <Link
                  key={brand}
                  to={`/masculino/produtos?brand=${encodeURIComponent(brand)}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 select-none cursor-pointer"
                  style={{ background: 'rgba(68,64,60,0.3)', border: '1px solid rgba(120,113,108,0.3)', color: '#D6D3D1', fontFamily: "'Montserrat', sans-serif" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,154,108,0.5)'; (e.currentTarget as HTMLElement).style.color = '#C49A6C'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,113,108,0.3)'; (e.currentTarget as HTMLElement).style.color = '#D6D3D1'; }}
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════ */}
      <section className="py-16 masc-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#C49A6C', fontFamily: "'Montserrat', sans-serif" }}>Destaque</p>
              <h2 className="font-bold text-3xl mb-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#F5F0EB' }}>Coleção</h2>
              <p className="text-sm" style={{ color: '#57534E', fontFamily: "'Montserrat', sans-serif" }}>Selecionados para o homem moderno</p>
            </div>
            <Link to="/masculino/produtos"
              className="flex items-center gap-1 text-sm font-semibold transition-colors select-none cursor-pointer"
              style={{ color: '#C49A6C', fontFamily: "'Montserrat', sans-serif" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#D4B07C'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#C49A6C'}>
              Ver tudo <ChevronRight size={15} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#292524', border: '1px solid rgba(68,64,60,0.5)' }}>
                  <div className="aspect-[4/5]" style={{ background: '#3D2B1F' }} />
                  <div className="p-4 space-y-2">
                    <div className="h-3 rounded-full w-1/3" style={{ background: '#44403C' }} />
                    <div className="h-4 rounded-full w-4/5" style={{ background: '#44403C' }} />
                    <div className="h-5 rounded-full w-1/2" style={{ background: '#44403C' }} />
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
                  <ProductCard product={p} theme="masculino" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA BOTTOM
      ════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0C0A09 0%, #1C1917 50%, #3D2B1F 100%)' }}>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-72 h-72 rounded-full top-0 right-0 opacity-15"
            style={{ background: 'radial-gradient(circle, #C49A6C, transparent)', filter: 'blur(70px)' }} />
          <div className="absolute w-48 h-48 rounded-full bottom-0 left-16 opacity-10"
            style={{ background: 'radial-gradient(circle, #57534E, transparent)', filter: 'blur(50px)' }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
            style={{ background: 'rgba(196,154,108,0.1)', border: '1px solid rgba(196,154,108,0.25)' }}>
            <Flame size={24} style={{ color: '#C49A6C' }} />
          </div>
          <h2 className="font-bold mb-4 leading-tight" style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            color: '#F5F0EB',
          }}>
            Sua assinatura pessoal começa aqui.
          </h2>
          <p className="mb-8 text-base leading-relaxed" style={{ color: 'rgba(245,240,235,0.5)', fontFamily: "'Montserrat', sans-serif" }}>
            Explore a coleção completa masculina e escolha o produto que vai definir o seu estilo.
          </p>
          <Link to="/masculino/produtos"
            className="btn-masc-gold inline-flex !px-8 !py-4 !text-base"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Ver Coleção Completa <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
