import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Shield, MessageCircle, Star,
  Droplets, Wind, Scissors, Flower2, FlameKindling, Paintbrush2,
  ChevronRight, Heart, Zap,
} from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import api from '../services/api';

const CATEGORIES = [
  { slug: 'maquiagem', label: 'Maquiagem',  Icon: Paintbrush2,   color: '#D4509F', bg: 'rgba(212,80,159,0.07)',  border: 'rgba(212,80,159,0.18)' },
  { slug: 'skincare',  label: 'Skincare',   Icon: Droplets,      color: '#6366F1', bg: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.18)' },
  { slug: 'cabelo',    label: 'Cabelo',     Icon: Scissors,      color: '#B45309', bg: 'rgba(180,83,9,0.07)',    border: 'rgba(180,83,9,0.18)'   },
  { slug: 'perfumes',  label: 'Perfumes',   Icon: Wind,          color: '#7C3AED', bg: 'rgba(124,58,237,0.07)',  border: 'rgba(124,58,237,0.18)' },
  { slug: 'corpo',     label: 'Corpo',      Icon: Flower2,       color: '#D4509F', bg: 'rgba(212,80,159,0.07)',  border: 'rgba(212,80,159,0.18)' },
  { slug: 'unhas',     label: 'Unhas',      Icon: FlameKindling, color: '#E11D48', bg: 'rgba(225,29,72,0.07)',   border: 'rgba(225,29,72,0.18)'  },
];

const TRUST = [
  { Icon: Shield,        text: 'Produtos 100% originais' },
  { Icon: Zap,           text: 'Entrega rápida e segura'  },
  { Icon: MessageCircle, text: 'Atendimento via WhatsApp'  },
  { Icon: Star,          text: 'As melhores marcas'        },
];

const PETALS = [
  { left: '6%',  delay: 0,   dur: 8,  size: 8,  pdx:  12, prot:  30, color: 'rgba(212,80,159,0.25)'  },
  { left: '20%', delay: 1.5, dur: 9,  size: 6,  pdx: -10, prot: -22, color: 'rgba(196,164,90,0.2)'   },
  { left: '38%', delay: 2.8, dur: 10, size: 9,  pdx:  16, prot:  48, color: 'rgba(212,80,159,0.2)'   },
  { left: '56%', delay: 0.9, dur: 8,  size: 7,  pdx: -13, prot: -38, color: 'rgba(139,92,246,0.18)'  },
  { left: '74%', delay: 2.1, dur: 11, size: 8,  pdx:  11, prot:  33, color: 'rgba(196,164,90,0.22)'  },
  { left: '90%', delay: 3.5, dur: 9,  size: 6,  pdx: -10, prot: -18, color: 'rgba(212,80,159,0.18)'  },
];

export default function Home() {
  const [featured, setFeatured]   = useState<Product[]>([]);
  const [storeName, setStoreName] = useState('Beauty Store');
  const [banner, setBanner]       = useState<string | null>(null);
  const [brands, setBrands]       = useState<string[]>([]);
  const [hasPromo, setHasPromo]   = useState(false);

  useEffect(() => {
    api.get('/products?limit=8&gender=feminino').then(r => {
      setFeatured(r.data.products);
      const unique = [...new Set<string>(
        r.data.products.map((p: Product) => p.brand).filter(Boolean) as string[]
      )];
      setBrands(unique);
      setHasPromo(r.data.products.some((p: Product) => p.price_promotion));
    });
    api.get('/config').then(r => {
      if (r.data.store_name) setStoreName(r.data.store_name);
      if (r.data.banner_url) setBanner(r.data.banner_url);
    });
  }, []);

  return (
    <main style={{ background: '#FFF8F3' }}>

      {/* ════════════════════════════════════
          HERO — Light mesh luxury
          Base: #FDF2F8 blush → flui para cream
          Sem dark overlay, sem gradiente escuro
      ════════════════════════════════════ */}
      <section className="fem-hero min-h-[600px] sm:min-h-[640px] flex items-center">

        {banner && (
          <img
            src={banner} alt=""
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
            style={{ opacity: 0.06, zIndex: 1 }}
          />
        )}

        {/* Pétalas flutuantes — transform-only = GPU friendly */}
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

        {/* Content — texto escuro sobre fundo claro = contraste perfeito */}
        <div className="fem-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
          <div className="max-w-xl" style={{ animation: 'fem-fade-up 0.6s ease-out both' }}>

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(212,80,159,0.1)',
                border: '1px solid rgba(212,80,159,0.25)',
              }}
            >
              <Sparkles size={12} style={{ color: '#D4509F' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#9B1A5A' }}>
                Coleção Feminina
              </span>
            </div>

            {/* Nome da loja — texto escuro, alto contraste */}
            <h1
              className="font-display font-bold leading-[1.05] mb-3"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 4.5rem)', color: '#3D0030' }}
            >
              {storeName}
            </h1>

            {/* Tagline — rose shimmer animado, harmonia com masculina */}
            <p
              className="font-display italic fem-shimmer-text mb-5"
              style={{ fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', fontWeight: 400 }}
            >
              Sua beleza. Nossa paixão.
            </p>

            <p
              className="text-base sm:text-lg mb-9 leading-relaxed max-w-md"
              style={{ color: '#7B3060' }}
            >
              Produtos selecionados com carinho para realçar o que você já tem de mais bonito.
              Qualidade premium, preços que cabem no bolso.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/produtos?gender=feminino"
                className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm text-white transition-all select-none cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #D4509F 0%, #9B3DBF 100%)',
                  boxShadow: '0 4px 20px rgba(212,80,159,0.35)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(212,80,159,0.45)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(212,80,159,0.35)'; }}
              >
                Ver Coleção <ArrowRight size={16} />
              </Link>
              <Link
                to="/produtos?promo=true&gender=feminino"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all select-none cursor-pointer"
                style={{
                  border: '1.5px solid rgba(212,80,159,0.4)',
                  color: '#A83380',
                  background: 'rgba(212,80,159,0.04)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,80,159,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,80,159,0.7)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,80,159,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,80,159,0.4)'; }}
              >
                <Heart size={14} />
                Ver Promoções
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          TRUST STRIP — flui naturalmente do hero claro
      ════════════════════════════════════ */}
      <section style={{ background: '#FFF8F3', borderBottom: '1px solid rgba(212,80,159,0.12)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {TRUST.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs font-medium py-1" style={{ color: '#9B8FA0' }}>
                <Icon size={13} style={{ color: '#D4509F', flexShrink: 0 }} />
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
      <section className="py-14" style={{ background: '#FFF8F3' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4509F' }}>Explore</p>
            <h2 className="font-display text-3xl font-bold" style={{ color: '#3D0030' }}>Categorias</h2>
            <p className="mt-2 text-sm" style={{ color: '#9B8FA0' }}>Encontre o que você precisa</p>
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
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${color}20`;
                  (e.currentTarget as HTMLElement).style.borderColor = color + '60';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.borderColor = border;
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-250 group-hover:scale-110"
                  style={{ background: color + '18' }}
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
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4509F' }}>Parceiros</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: '#3D0030' }}>Nossas Marcas</h2>
              <p className="mt-1.5 text-sm" style={{ color: '#9B8FA0' }}>Marcas que você conhece e confia</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {brands.map(brand => (
                <Link
                  key={brand}
                  to={`/produtos?brand=${encodeURIComponent(brand)}&gender=feminino`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 select-none cursor-pointer"
                  style={{ background: '#FDF0F8', border: '1px solid rgba(212,80,159,0.15)', color: '#7B3060' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAE0F2'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,80,159,0.45)'; (e.currentTarget as HTMLElement).style.color = '#D4509F'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FDF0F8'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,80,159,0.15)'; (e.currentTarget as HTMLElement).style.color = '#7B3060'; }}
                >
                  {brand}
                </Link>
              ))}
              <Link
                to="/produtos?gender=feminino"
                className="px-5 py-2.5 text-white rounded-full text-sm font-medium flex items-center gap-1.5 select-none cursor-pointer transition-all"
                style={{ background: 'linear-gradient(135deg, #D4509F, #9B3DBF)', boxShadow: '0 3px 12px rgba(212,80,159,0.3)' }}
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
      <section className="py-14" style={{ background: brands.length > 0 ? '#FFF8F3' : 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#D4509F' }}>Coleção</p>
              <h2 className="font-display text-3xl font-bold" style={{ color: '#3D0030' }}>Destaques</h2>
              <p className="mt-1 text-sm" style={{ color: '#9B8FA0' }}>Os favoritos das nossas clientes</p>
            </div>
            <Link
              to="/produtos?gender=feminino"
              className="flex items-center gap-1 text-sm font-semibold transition-colors select-none cursor-pointer"
              style={{ color: '#D4509F' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#A83380'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#D4509F'}
            >
              Ver tudo <ChevronRight size={15} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#FDF0F8', border: '1px solid rgba(212,80,159,0.08)' }}>
                  <div className="aspect-[4/5]" style={{ background: '#FAE0F2' }} />
                  <div className="p-4 space-y-2">
                    <div className="h-3 rounded-full w-1/3" style={{ background: '#FAE0F2' }} />
                    <div className="h-4 rounded-full w-4/5" style={{ background: '#FAE0F2' }} />
                    <div className="h-5 rounded-full w-1/2" style={{ background: '#FAE0F2' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} theme="feminino" />)}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA BOTTOM — rose sólido editorial
          Equivalente ao dark CTA masculino
          mas em rose bold = identidade feminina
      ════════════════════════════════════ */}
      <section className="fem-cta-section py-20">
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Sparkles size={24} style={{ color: 'rgba(255,255,255,0.9)' }} />
          </div>
          <h2
            className="font-display font-bold mb-4 leading-tight text-white"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}
          >
            Pronta para se sentir incrível?
          </h2>
          <p className="mb-8 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Explore nossa coleção completa e descubra o produto perfeito para cada momento do seu dia.
          </p>
          <Link
            to="/produtos?gender=feminino"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full transition-all text-sm select-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)', color: '#fff', backdropFilter: 'blur(8px)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            Explorar Coleção <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
