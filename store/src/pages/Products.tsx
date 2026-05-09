import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Tag } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import api from '../services/api';

const CATEGORIES = ['maquiagem', 'skincare', 'cabelo', 'corpo', 'perfumes', 'unhas', 'outros'];
const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Mais recentes' },
  { value: 'price_normal:asc', label: 'Menor preço' },
  { value: 'price_normal:desc', label: 'Maior preço' },
  { value: 'name:asc', label: 'A – Z' },
];

function FilterPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-150 select-none ${
        active
          ? 'bg-brand-rose text-white shadow-sm'
          : 'bg-white border border-brand-sand text-brand-muted hover:border-brand-rose hover:text-brand-rose'
      }`}
    >
      {children}
    </button>
  );
}

export default function Products() {
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

  /* Fetch unique brands once on mount */
  useEffect(() => {
    api.get('/products?limit=100').then(r => {
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
      const params = new URLSearchParams({ limit: '20', page: String(p), sort: sortField, dir: sortDir });
      if (search)   params.set('q', search);
      if (category) params.set('category', category);
      if (brand)    params.set('brand', brand);
      const { data } = await api.get(`/products?${params}`);
      setProducts(p === 1 ? data.products : prev => [...prev, ...data.products]);
      setTotal(data.pagination.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, sort]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const set = (key: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    });
  };

  const hasFilters = search || category || brand;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-dark">Produtos</h1>
        <p className="text-brand-muted mt-1 text-sm">
          {loading ? 'Carregando...' : `${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-2xl border border-brand-sand/60 shadow-card p-4 mb-8 space-y-4">

        {/* Search + sort row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => set('q', e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full bg-brand-cream border border-brand-sand rounded-full pl-10 pr-4 py-2.5 text-sm text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-rose/25 focus:border-brand-rose focus:bg-white transition-all"
            />
          </div>
          <select
            value={sort}
            onChange={e => set('sort', e.target.value)}
            className="bg-brand-cream border border-brand-sand rounded-full px-4 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-rose/25 focus:border-brand-rose focus:bg-white transition-all appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Category filters */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <SlidersHorizontal size={13} className="text-brand-muted" />
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest">Categoria</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={!category} onClick={() => set('category', '')}>Todas</FilterPill>
            {CATEGORIES.map(c => (
              <FilterPill key={c} active={category === c} onClick={() => set('category', c)}>{c}</FilterPill>
            ))}
          </div>
        </div>

        {/* Brand filters (only when brands exist) */}
        {allBrands.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Tag size={13} className="text-brand-muted" />
              <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest">Marca</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterPill active={!brand} onClick={() => set('brand', '')}>Todas</FilterPill>
              {allBrands.map(b => (
                <FilterPill key={b} active={brand === b} onClick={() => set('brand', b)}>{b}</FilterPill>
              ))}
            </div>
          </div>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <div className="pt-1 border-t border-brand-sand/50">
            <button
              onClick={() => setSearchParams({})}
              className="text-xs text-brand-muted hover:text-red-500 flex items-center gap-1 transition-colors select-none"
            >
              <X size={12} /> Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Product grid */}
      {loading && products.length === 0 ? (
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
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-brand-muted">
          <Search size={44} className="mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg text-brand-dark">Nenhum produto encontrado</p>
          <p className="text-sm mt-1">Tente outros termos ou categorias</p>
          <button onClick={() => setSearchParams({})} className="mt-6 btn-outline text-sm px-5 py-2.5 min-h-0 h-10">
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {products.length < total && (
            <div className="text-center mt-12">
              <button
                onClick={() => fetchProducts(page + 1)}
                disabled={loading}
                className="btn-outline mx-auto"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
                  : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
