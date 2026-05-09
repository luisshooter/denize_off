import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, MessageCircle, Star } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import api from '../services/api';

const CATEGORIES = [
  { slug: 'maquiagem', label: 'Maquiagem', emoji: '💄', bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-600' },
  { slug: 'skincare',  label: 'Skincare',  emoji: '✨', bg: 'bg-sky-50',  border: 'border-sky-100',  text: 'text-sky-600'  },
  { slug: 'cabelo',    label: 'Cabelo',    emoji: '💇', bg: 'bg-amber-50',border: 'border-amber-100',text: 'text-amber-600'},
  { slug: 'perfumes',  label: 'Perfumes',  emoji: '🌸', bg: 'bg-purple-50',border:'border-purple-100',text:'text-purple-600'},
  { slug: 'corpo',     label: 'Corpo',     emoji: '🧴', bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-600' },
  { slug: 'unhas',     label: 'Unhas',     emoji: '💅', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600' },
];

const FEATURES = [
  { icon: Shield,         text: 'Produtos originais garantidos' },
  { icon: Sparkles,       text: 'Qualidade premium selecionada' },
  { icon: MessageCircle,  text: 'Atendimento pelo WhatsApp'    },
  { icon: Star,           text: 'As melhores marcas de beleza' },
];

export default function Home() {
  const [featured, setFeatured]     = useState<Product[]>([]);
  const [storeName, setStoreName]   = useState('Beauty Store');
  const [banner, setBanner]         = useState<string | null>(null);
  const [brands, setBrands]         = useState<string[]>([]);

  useEffect(() => {
    api.get('/products?limit=8').then(r => {
      setFeatured(r.data.products);
      const unique = [...new Set<string>(
        r.data.products.map((p: Product) => p.brand).filter(Boolean) as string[]
      )];
      setBrands(unique);
    });
    api.get('/config').then(r => {
      if (r.data.store_name) setStoreName(r.data.store_name);
      if (r.data.banner_url) setBanner(r.data.banner_url);
    });
  }, []);

  return (
    <main>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-[#2d1b3e] to-brand-rose-dark min-h-[520px] flex items-center">
        {banner && (
          <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-luminosity" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/50 to-transparent" />

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-rose/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-32 w-64 h-64 bg-brand-gold/15 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={13} className="text-brand-gold" />
              <span className="text-white/90 text-xs font-medium tracking-wide">Beleza que transforma</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5">
              {storeName}
            </h1>

            <p className="text-white/70 text-base sm:text-lg mb-8 leading-relaxed">
              Os melhores produtos de beleza selecionados para você. Qualidade e estilo em cada detalhe.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/produtos" className="btn-rose !bg-white !text-brand-rose hover:!bg-brand-rose-light !shadow-none">
                Ver Produtos <ArrowRight size={16} />
              </Link>
              <Link
                to="/produtos?sort=price_normal:asc"
                className="px-6 py-3 border border-white/30 text-white rounded-full text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2 select-none"
              >
                Ver Promoções
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="bg-white border-b border-brand-sand/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-brand-muted text-xs font-medium py-1">
                <Icon size={14} className="text-brand-rose flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-14 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-brand-dark">Categorias</h2>
            <p className="text-brand-muted mt-2 text-sm">Encontre o que você procura</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORIES.map(({ slug, label, emoji, bg, border, text }) => (
              <Link
                key={slug}
                to={`/produtos?category=${slug}`}
                className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border ${bg} ${border} hover:shadow-card hover:-translate-y-0.5 transition-all duration-300`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                <span className={`text-xs font-semibold ${text} text-center leading-tight`}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brands ── (only renders when products have brands) */}
      {brands.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-brand-dark">Nossas Marcas</h2>
              <p className="text-brand-muted mt-1.5 text-sm">Marcas que você conhece e confia</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {brands.map(brand => (
                <Link
                  key={brand}
                  to={`/produtos?brand=${encodeURIComponent(brand)}`}
                  className="px-5 py-2.5 bg-brand-cream hover:bg-brand-rose-light border border-brand-sand hover:border-brand-rose text-brand-dark hover:text-brand-rose rounded-full text-sm font-medium transition-all duration-200 select-none"
                >
                  {brand}
                </Link>
              ))}
              <Link
                to="/produtos"
                className="px-5 py-2.5 bg-brand-rose text-white rounded-full text-sm font-medium hover:bg-brand-rose-dark transition-colors duration-200 flex items-center gap-1.5 select-none"
              >
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured products ── */}
      <section className={`py-14 ${brands.length > 0 ? 'bg-brand-cream' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-brand-dark">Destaques</h2>
              <p className="text-brand-muted mt-1.5 text-sm">Produtos mais populares</p>
            </div>
            <Link to="/produtos" className="text-brand-rose text-sm font-semibold hover:text-brand-rose-dark flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                  <div className="aspect-[4/5] bg-brand-sand" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-brand-sand rounded-full w-1/3" />
                    <div className="h-4 bg-brand-sand rounded-full w-4/5" />
                    <div className="h-5 bg-brand-sand rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="py-16 bg-gradient-to-br from-brand-dark to-[#2d1b3e] text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Sparkles size={28} className="text-brand-gold mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-3">Pronta para se cuidar?</h2>
          <p className="text-white/70 mb-8 text-base">
            Explore nossa coleção completa e encontre produtos perfeitos para você.
          </p>
          <Link to="/produtos" className="btn-rose !bg-white !text-brand-rose hover:!bg-brand-rose-light !shadow-none inline-flex">
            Explorar Produtos <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
