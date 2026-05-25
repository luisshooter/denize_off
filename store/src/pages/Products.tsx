import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Tag } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import api from '../services/api';

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
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-150 select-none cursor-pointer ${
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
  const [allBrands, setAllBrands]       = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const search   = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const brand    = searchParams.get('brand') || '';
  const sort     = searchParams.get('sort') || 'created_at:desc';
  const promo    = searchParams.get('promo') === 'true';

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
      const params = new URLSearchParams({ limit: '2000', sort: sortField, dir: sortDir });
      if (search)   params.set('q', search);
      if (category) params.set('category', category);
      if (brand)    params.set('brand', brand);
      if (promo)    params.set('promo', 'true');
      const genderParam = searchParams.get('gender') || 'feminino';
      params.set('gender', genderParam);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.pagination.total);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, sort, promo, searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* scroll reveal */
  useEffect(() => {
    if (!gridRef.current || !products.length) return;
    const cards = Array.from(gridRef.current.querySelectorAll<HTMLElement>('.card-reveal'));
    if (!cards.length) return;
    const reveal = (el: HTMLElement) => el.classList.add('in-view');
    const fallback = setTimeout(() => cards.forEach(reveal), 800);
    if (!window.IntersectionObserver) { cards.forEach(reveal); clearTimeout(fallback); return; }
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { reveal(e.target as HTMLElement); observer.unobserve(e.target); } }),
      { threshold: 0.01, rootMargin: '0px 0px 60px 0px' }
    );
    cards.forEach(c => observer.observe(c));
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [products]);

  const set = (key: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    });
  };

  const hasFilters = search || category || brand || promo;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-dark">
            {promo ? 'Em Promoção' : 'Produtos'}
          </h1>
          <p className="text-brand-muted mt-1 text-sm">
            {loading ? 'Carregando...' : `${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => set('promo', '')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all select-none cursor-pointer ${
              !promo
                ? 'bg-brand-dark text-white shadow-sm'
                : 'bg-white border border-brand-sand text-brand-muted hover:text-brand-dark'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => set('promo', 'true')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 select-none cursor-pointer ${
              promo
                ? 'bg-brand-rose text-white shadow-rose'
                : 'bg-white border border-brand-sand text-brand-muted hover:border-brand-rose hover:text-brand-rose'
            }`}
          >
            <Tag size={13} /> Em Promoção
          </button>
        </div>
      </div>

      {promo && <PromoBanner />}

      {/* Filter panel */}
      <div className="bg-white rounded-2xl border border-brand-sand/60 shadow-card p-4 mb-8 space-y-4">

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

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <SlidersHorizontal size={13} className="text-brand-muted" />
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest">Categoria</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={!category} onClick={() => set('category', '')}>Todas</FilterPill>
            {allCategories.map(c => (
              <FilterPill key={c} active={category === c} onClick={() => set('category', c)}>{c}</FilterPill>
            ))}
          </div>
        </div>

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

        {hasFilters && (
          <div className="pt-1 border-t border-brand-sand/50">
            <button
              onClick={() => setSearchParams({})}
              className="text-xs text-brand-muted hover:text-red-500 flex items-center gap-1 transition-colors select-none cursor-pointer"
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
          <button onClick={() => setSearchParams({})} className="mt-6 btn-outline text-sm px-5 py-2.5 min-h-0 h-10 cursor-pointer">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <div key={p.id} className="card-reveal" data-reveal={i % 2 === 0 ? 'left' : 'right'} style={{ transitionDelay: `${(i % 12) * 55}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
