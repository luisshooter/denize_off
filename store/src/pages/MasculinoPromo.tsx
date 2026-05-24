import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import MascPromoBanner from '../components/MascPromoBanner';
import ProductCard, { Product } from '../components/ProductCard';
import api from '../services/api';

export default function MasculinoPromo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const gridRef  = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?limit=2000&gender=masculino&promo=true')
      .then(r => { setProducts(r.data.products); setTotal(r.data.pagination.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll<HTMLElement>('.card-reveal');
    if (!cards.length) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in-view'); obs.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, [products]);

  return (
    <main className="min-h-screen" style={{ background: '#0C0A09' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* back */}
        <button
          onClick={() => navigate('/masculino/produtos')}
          className="flex items-center gap-1.5 mb-6 transition-colors cursor-pointer"
          style={{ color: '#57534E', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8125rem', letterSpacing: '0.02em' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C49A6C')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#57534E')}
        >
          <ChevronLeft size={15} />
          Voltar a Para Ele
        </button>

        <MascPromoBanner />

        <p className="text-sm mb-8" style={{ color: '#44403C', fontFamily: "'Montserrat', sans-serif" }}>
          {loading ? 'Carregando...' : total > 0
            ? `${total} produto${total !== 1 ? 's' : ''} em promoção`
            : 'Nenhuma promoção ativa'}
        </p>

        {/* skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#1A1714', border: '1px solid rgba(68,64,60,0.4)' }}>
                <div className="aspect-[4/5]" style={{ background: '#2A1F18' }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded-full w-1/3" style={{ background: '#3A3330' }} />
                  <div className="h-4 rounded-full w-4/5" style={{ background: '#3A3330' }} />
                  <div className="h-5 rounded-full w-1/2" style={{ background: '#3A3330' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(196,154,108,0.06)', border: '1px solid rgba(196,154,108,0.18)' }}>
              <Search size={28} style={{ color: '#C49A6C', opacity: 0.45 }} />
            </div>
            <p className="font-bold mb-2" style={{ color: '#D6D3D1', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem' }}>
              Nenhuma promoção no momento
            </p>
            <p className="text-sm mb-8" style={{ color: '#44403C', fontFamily: "'Montserrat', sans-serif" }}>
              Fique de olho — novas ofertas chegam em breve
            </p>
            <button
              onClick={() => navigate('/masculino/produtos')}
              className="btn-masc-outline mx-auto"
            >
              Ver todos os produtos
            </button>
          </div>
        )}

        {/* grid */}
        {!loading && products.length > 0 && (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <div key={p.id} className="card-reveal" style={{ transitionDelay: `${(i % 12) * 55}ms` }}>
                <ProductCard product={p} theme="masculino" />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
