import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import api from '../services/api';

const CATEGORIES = [
  { slug: 'maquiagem', label: 'Maquiagem', emoji: '💄', color: 'from-pink-400 to-brand-rose' },
  { slug: 'skincare', label: 'Skincare', emoji: '✨', color: 'from-sky-400 to-blue-500' },
  { slug: 'cabelo', label: 'Cabelo', emoji: '💇', color: 'from-amber-400 to-orange-500' },
  { slug: 'perfumes', label: 'Perfumes', emoji: '🌸', color: 'from-purple-400 to-violet-500' },
  { slug: 'corpo', label: 'Corpo', emoji: '🧴', color: 'from-teal-400 to-emerald-500' },
  { slug: 'unhas', label: 'Unhas', emoji: '💅', color: 'from-rose-400 to-pink-500' }
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState('Beauty Store');
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    api.get('/products?limit=8').then(r => setFeatured(r.data.products));
    api.get('/config').then(r => {
      if (r.data.store_name) setStoreName(r.data.store_name);
      if (r.data.banner_url) setBanner(r.data.banner_url);
    });
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-rose-dark to-brand-rose min-h-[480px] flex items-center">
        {banner && (
          <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={14} className="text-brand-gold" />
              <span className="text-white text-sm font-medium">Beleza que transforma</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {storeName}
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Os melhores produtos de beleza selecionados para você. Qualidade e estilo em cada detalhe.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/produtos" className="btn-rose bg-white !text-brand-rose hover:!bg-brand-rose-light">
                Ver Produtos <ArrowRight size={18} />
              </Link>
              <Link to="/produtos" className="px-6 py-3 border-2 border-white/50 text-white rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
                Promoções
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-10 right-10 w-48 h-48 bg-brand-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-32 w-32 h-32 bg-brand-rose-light/20 rounded-full blur-2xl" />
      </section>

      {/* Features strip */}
      <section className="bg-brand-dark py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-white/70 text-sm">
            {[
              [Shield, 'Produtos originais garantidos'],
              [Sparkles, 'Qualidade premium selecionada'],
              [Truck, 'Atendimento pelo WhatsApp']
            ].map(([Icon, text]) => (
              <div key={String(text)} className="flex items-center gap-2">
                <Icon size={16} className="text-brand-gold" />
                <span>{String(text)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-brand-dark">Categorias</h2>
            <p className="text-gray-400 mt-2">Encontre o que você procura</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map(({ slug, label, emoji, color }) => (
              <Link
                key={slug}
                to={`/produtos?category=${slug}`}
                className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                  {emoji}
                </div>
                <span className="text-xs font-semibold text-brand-dark text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-brand-dark">Destaques</h2>
              <p className="text-gray-400 mt-2">Produtos mais populares</p>
            </div>
            <Link to="/produtos" className="text-brand-rose text-sm font-semibold hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
