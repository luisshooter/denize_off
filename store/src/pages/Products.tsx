import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import api from '../services/api';

const CATEGORIES = ['maquiagem', 'skincare', 'cabelo', 'corpo', 'perfumes', 'unhas', 'outros'];
const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Mais recentes' },
  { value: 'price_normal:asc', label: 'Menor preço' },
  { value: 'price_normal:desc', label: 'Maior preço' },
  { value: 'name:asc', label: 'A - Z' }
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'created_at:desc';

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const [sortField, sortDir] = sort.split(':');
      const params = new URLSearchParams({ limit: '20', page: String(p), sort: sortField, dir: sortDir });
      if (search) params.set('q', search);
      if (category) params.set('category', category);
      const { data } = await api.get(`/products?${params}`);
      setProducts(p === 1 ? data.products : prev => [...prev, ...data.products]);
      setTotal(data.pagination.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const set = (key: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-dark">Produtos</h1>
        <p className="text-gray-400 mt-1">{total} produto(s) encontrado(s)</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => set('q', e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30 focus:border-brand-rose"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={e => set('sort', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30 focus:border-brand-rose"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <SlidersHorizontal size={14} className="text-gray-400" />
          {['', ...CATEGORIES].map(c => (
            <button
              key={c}
              onClick={() => set('category', c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                category === c
                  ? 'bg-brand-rose text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-brand-rose-light hover:text-brand-rose'
              }`}
            >
              {c || 'Todos'}
            </button>
          ))}
          {(search || category) && (
            <button
              onClick={() => setSearchParams({})}
              className="ml-auto text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading && products.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg">Nenhum produto encontrado</p>
          <p className="text-sm mt-1">Tente outros termos ou categorias</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {products.length < total && (
            <div className="text-center mt-10">
              <button
                onClick={() => fetchProducts(page + 1)}
                disabled={loading}
                className="btn-outline mx-auto"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
                ) : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
