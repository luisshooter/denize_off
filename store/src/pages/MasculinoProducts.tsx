import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import { useStoreConfig } from '../context/StoreConfigContext';
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
        ? { background: 'linear-gradient(135deg, #CA8A04, #A16207)', color: '#0C0A09', boxShadow: '0 2px 10px rgba(202,138,4,0.3)' }
        : { background: 'rgba(68,64,60,0.4)', border: '1px solid rgba(120,113,108,0.3)', color: '#78716C' }
      }
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(202,138,4,0.5)'; (e.currentTarget as HTMLElement).style.color = '#CA8A04'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,113,108,0.3)'; (e.currentTarget as HTMLElement).style.color = '#78716C'; } }}
    >
      {children}
    </button>
  );
}

export default function MasculinoProducts() {
  const { categories: CATEGORIES } = useStoreConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState<Product[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [allBrands, setAllBrands]       = useState<string[]>([]);

  const search   = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const brand    = searchParams.get('brand') || '';
  const sort     = searchParams.get('sort') || 'created_at:desc';

  useEffect(() => {
    api.get('/products?limit=100&gender=masculino').then(r => {
      const unique = [...new Set<string>(
        r.data.products.map((p: Product) => p.brand).filter(Boolean) as string[]
      )].sort();
      setAllBrands(unique);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const [sortField, sortDir] = sort.split(':');
      const params = new URLSearchParams({
        limit: '20',
        page: String(p),
        sort: sortField,
        dir: sortDir,
        gender: 'masculino',
      });
      if (search) params.set('q', search);
      if (category) params.set('category', category);
      if (brand) params.set('brand', brand);

      const { data } = await api.get(`/products?${params}`);
      setProducts(prev => p === 1 ? data.products : [...prev, ...data.products]);
      setTotal(data.pagination.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, sort]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

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
            style={{ background: 'radial-gradient(circle, #CA8A04, transparent)', filter: 'blur(70px)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#CA8A04', fontFamily: "'Jost', sans-serif" }}>Coleção</p>
          <h1 className="font-bold mb-2" style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F5F0EB' }}>
            Para Ele
          </h1>
          <p className="text-sm" style={{ color: '#78716C', fontFamily: "'Jost', sans-serif" }}>
            {total > 0 ? `${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}` : 'Carregando...'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Filters ── */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: '#141210', border: '1px solid rgba(68,64,60,0.4)' }}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
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

            {/* Sort */}
            <select
              value={sort}
              onChange={e => set('sort', e.target.value)}
              className="rounded-full px-4 py-2.5 text-sm font-medium transition-all cursor-pointer"
              style={{ background: 'rgba(68,64,60,0.4)', border: '1px solid rgba(120,113,108,0.3)', color: '#D6D3D1', fontFamily: "'Jost', sans-serif" }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Category pills */}
          {CATEGORIES.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <MascFilterPill active={!category} onClick={() => clear('category')}>
                Todos
              </MascFilterPill>
              {CATEGORIES.map(c => (
                <MascFilterPill key={c} active={category === c} onClick={() => set('category', category === c ? '' : c)}>
                  {c}
                </MascFilterPill>
              ))}
            </div>
          )}

          {/* Brand pills */}
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

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs py-1.5" style={{ color: '#78716C', fontFamily: "'Jost', sans-serif" }}>
              <SlidersHorizontal size={12} className="inline mr-1" />
              Filtros:
            </span>
            {activeFilters.map(f => (
              <span
                key={f.key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(202,138,4,0.12)', color: '#CA8A04', border: '1px solid rgba(202,138,4,0.25)' }}>
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
              style={{ background: 'rgba(202,138,4,0.08)', border: '1px solid rgba(202,138,4,0.2)' }}>
              <Search size={24} style={{ color: '#CA8A04', opacity: 0.5 }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: '#D6D3D1', fontFamily: "'Bodoni Moda', Georgia, serif", fontSize: '1.2rem' }}>
              Nenhum produto encontrado
            </p>
            <p className="text-sm" style={{ color: '#57534E', fontFamily: "'Jost', sans-serif" }}>
              Tente outros filtros ou explore a coleção completa
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} theme="masculino" />)}
            </div>

            {products.length < total && (
              <div className="text-center mt-10">
                <button
                  onClick={() => fetchProducts(page + 1)}
                  disabled={loading}
                  className="btn-masc-outline px-10 py-3.5 text-sm disabled:opacity-40"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {loading ? 'Carregando...' : `Ver mais (${total - products.length} restantes)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
