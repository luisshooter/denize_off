import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Flame } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import api from '../services/api';

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Mais recentes' },
  { value: 'price_normal:asc', label: 'Menor preço' },
  { value: 'price_normal:desc', label: 'Maior preço' },
  { value: 'name:asc', label: 'A – Z' },
];

function MascFilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-150 select-none cursor-pointer"
      style={active
        ? { background: 'linear-gradient(135deg, #C49A6C, #A07845)', color: '#0C0A09', boxShadow: '0 2px 10px rgba(196,154,108,0.3)' }
        : { background: 'rgba(68,64,60,0.4)', border: '1px solid rgba(120,113,108,0.3)', color: '#78716C' }
      }
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,154,108,0.5)'; (e.currentTarget as HTMLElement).style.color = '#C49A6C'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,113,108,0.3)'; (e.currentTarget as HTMLElement).style.color = '#78716C'; } }}
    >
      {children}
    </button>
  );
}

export default function MasculinoProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState<Product[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [allBrands, setAllBrands]       = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const gridRef  = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const search   = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const brand    = searchParams.get('brand') || '';
  const sort     = searchParams.get('sort') || 'created_at:desc';

  useEffect(() => {
    api.get('/products?limit=2000').then(r => {
      const ps: Product[] = r.data.products;
      const uniqueBrands = [...new Set<string>(ps.map(p => p.brand).filter(Boolean) as string[])].sort();
      const uniqueCats   = [...new Set<string>(ps.map((p: any) => p.category).filter(Boolean) as string[])].sort();
      setAllBrands(uniqueBrands);
      setAllCategories(uniqueCats);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortDir] = sort.split(':');
      const params = new URLSearchParams({
        limit: '2000',
        sort: sortField,
        dir: sortDir,
        gender: 'masculino',
      });
      if (search) params.set('q', search);
      if (category) params.set('category', category);
      if (brand) params.set('brand', brand);

      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.pagination.total);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* scroll reveal */
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll<HTMLElement>('.card-reveal');
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in-view'); observer.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    cards.forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, [products]);

  const set = (k: string, v: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (v) next.set(k, v); else next.delete(k);
      return next;
    });
  };
  const clear = (k: string) => set(k, '');
  const activeFilters = [
    search && { key: 'q', label: `"${search}"` },
    category && { key: 'category', label: category },
    brand && { key: 'brand', label: brand },
  ].filter(Boolean) as { key: string; label: string }[];

  const inputStyle = {
    background: 'rgba(28,25,23,0.8)',
    border: '1px solid rgba(120,113,108,0.3)',
    color: '#F5F0EB',
    borderRadius: '9999px',
    padding: '10px 16px 10px 40px',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  };

  return (
    <main className="min-h-screen" style={{ background: '#1C1917' }}>

      {/* ── Header ── */}
      <section className="py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0C0A09 0%, #1C1917 60%, #3D2B1F 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-80 h-80 rounded-full -top-20 -right-20 opacity-15"
            style={{ background: 'radial-gradient(circle, #C49A6C, transparent)', filter: 'blur(70px)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#C49A6C', fontFamily: "'Montserrat', sans-serif" }}>Coleção</p>
          <h1 className="font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F5F0EB' }}>
            Para Ele
          </h1>
          <p className="text-sm mb-5" style={{ color: '#78716C', fontFamily: "'Montserrat', sans-serif" }}>
            {total > 0 ? `${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}` : 'Carregando...'}
          </p>
          <button
            onClick={() => navigate('/masculino/promocoes')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(196,154,108,0.15), rgba(160,120,69,0.08))',
              border: '1px solid rgba(196,154,108,0.35)',
              color: '#C49A6C',
              fontFamily: "'Montserrat', sans-serif",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(196,154,108,0.25), rgba(160,120,69,0.15))'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,154,108,0.65)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(196,154,108,0.15), rgba(160,120,69,0.08))'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,154,108,0.35)'; }}
          >
            <Flame size={14} />
            Ver Promoções
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Filters ── */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: '#141210', border: '1px solid rgba(68,64,60,0.4)' }}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#78716C' }} />
              <input
                type="text"
                value={search}
                onChange={e => set('q', e.target.value)}
                placeholder="Buscar na coleção masculina..."
                style={inputStyle}
              />
            </div>

            <select
              value={sort}
              onChange={e => set('sort', e.target.value)}
              className="rounded-full px-4 py-2.5 text-sm font-medium transition-all cursor-pointer"
              style={{ background: 'rgba(68,64,60,0.4)', border: '1px solid rgba(120,113,108,0.3)', color: '#D6D3D1', fontFamily: "'Montserrat', sans-serif" }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <MascFilterPill active={!category} onClick={() => clear('category')}>
                Todos
              </MascFilterPill>
              {allCategories.map(c => (
                <MascFilterPill key={c} active={category === c} onClick={() => set('category', category === c ? '' : c)}>
                  {c}
                </MascFilterPill>
              ))}
            </div>
          )}

          {allBrands.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allBrands.map(b => (
                <MascFilterPill key={b} active={brand === b} onClick={() => set('brand', brand === b ? '' : b)}>
                  {b}
                </MascFilterPill>
              ))}
            </div>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs py-1.5" style={{ color: '#78716C', fontFamily: "'Montserrat', sans-serif" }}>
              <SlidersHorizontal size={12} className="inline mr-1" />
              Filtros:
            </span>
            {activeFilters.map(f => (
              <span
                key={f.key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(196,154,108,0.12)', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.25)' }}>
                {f.label}
                <button onClick={() => clear(f.key)} className="cursor-pointer hover:opacity-60 transition-opacity">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Grid ── */}
        {loading && products.length === 0 ? (
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
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(196,154,108,0.08)', border: '1px solid rgba(196,154,108,0.2)' }}>
              <Search size={24} style={{ color: '#C49A6C', opacity: 0.5 }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: '#D6D3D1', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem' }}>
              Nenhum produto encontrado
            </p>
            <p className="text-sm" style={{ color: '#57534E', fontFamily: "'Montserrat', sans-serif" }}>
              Tente outros filtros ou explore a coleção completa
            </p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <div key={p.id} className="card-reveal" data-reveal={i % 2 === 0 ? 'left' : 'right'} style={{ transitionDelay: `${(i % 12) * 55}ms` }}>
                <ProductCard product={p} theme="masculino" />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
