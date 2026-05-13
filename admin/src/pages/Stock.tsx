import { useEffect, useState, useCallback } from 'react';
import { Package, RefreshCw, Minus, Plus, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  price_normal: number;
  price_promotion: number | null;
  image_url: string | null;
  stock: number;
  status: 'active' | 'inactive';
  description: string | null;
  payment_method_ids: string[] | null;
}

const BRAND_CFG: Record<string, { label: string; color: string; bg: string; border: string; tagline: string }> = {
  Natura:  { label: 'Natura',  color: '#005240', bg: 'rgba(0,135,97,0.08)',   border: '#008761', tagline: 'Bem Estar Bem' },
  Avon:    { label: 'Avon',    color: '#7B0044', bg: 'rgba(201,24,128,0.08)', border: '#C91880', tagline: 'A empresa que mais entende de mulher' },
  Farmasi: { label: 'Farmasi', color: '#3D1A6E', bg: 'rgba(91,43,142,0.08)',  border: '#5B2B8E', tagline: 'Beleza acessível, qualidade premium' },
};

const BRAND_ORDER = ['Natura', 'Avon', 'Farmasi'];
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Record<string, number>>({});
  const [saving, setSaving]   = useState<Record<string, boolean>>({});
  const [saved,  setSaved]    = useState<Record<string, boolean>>({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products?limit=200');
      setProducts(data.products);
      setPending({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const getStock = (p: Product) =>
    pending[p.id] !== undefined ? pending[p.id] : p.stock;

  const adjust = (id: string, current: number, delta: number) =>
    setPending(prev => ({ ...prev, [id]: Math.max(0, current + delta) }));

  const setVal = (id: string, val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0) setPending(prev => ({ ...prev, [id]: n }));
  };

  const saveStock = async (product: Product) => {
    const newStock = pending[product.id];
    if (newStock === undefined) return;
    setSaving(prev => ({ ...prev, [product.id]: true }));
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        price_normal: product.price_normal,
        price_promotion: product.price_promotion,
        image_url: product.image_url,
        stock: newStock,
        status: product.status,
        payment_method_ids: product.payment_method_ids,
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
      setPending(prev => { const n = { ...prev }; delete n[product.id]; return n; });
      setSaved(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => setSaved(prev => { const n = { ...prev }; delete n[product.id]; return n; }), 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao salvar estoque');
    } finally {
      setSaving(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Group by brand
  const byBrand = products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.brand || '__outros__';
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  const otherBrands = Object.keys(byBrand).filter(
    k => !BRAND_ORDER.includes(k) && k !== '__outros__'
  ).sort();
  const groupOrder = [...BRAND_ORDER, ...otherBrands, '__outros__'];

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Controle de Estoque
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Estoque decrementado automaticamente ao confirmar pedido pelo carrinho
          </p>
        </div>
        <button onClick={fetchProducts} className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
          <RefreshCw size={15} /> Atualizar
        </button>
      </div>

      {/* Brand summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BRAND_ORDER.map(brand => {
          const cfg = BRAND_CFG[brand];
          const ps  = byBrand[brand] || [];
          const totalUnits = ps.reduce((s, p) => s + getStock(p), 0);
          const lowStock   = ps.filter(p => getStock(p) > 0 && getStock(p) <= 5).length;
          const outOfStock = ps.filter(p => getStock(p) === 0).length;

          return (
            <div key={brand} className="card" style={{ borderLeft: `4px solid ${cfg.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-base" style={{ color: cfg.color }}>{cfg.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {ps.length} produto{ps.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: cfg.bg }}>
                  <Package size={20} style={{ color: cfg.color }} />
                </div>
              </div>
              <div className="flex gap-5 text-sm">
                <div>
                  <p className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{totalUnits}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>unidades</p>
                </div>
                {lowStock > 0 && (
                  <div>
                    <p className="font-bold text-xl text-amber-500">{lowStock}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>baixo</p>
                  </div>
                )}
                {outOfStock > 0 && (
                  <div>
                    <p className="font-bold text-xl text-red-500">{outOfStock}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>esgotado</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product groups */}
      {groupOrder.filter(k => (byBrand[k]?.length ?? 0) > 0).map(brandKey => {
        const cfg = BRAND_CFG[brandKey] ?? {
          label: brandKey === '__outros__' ? 'Sem Marca' : brandKey,
          color: 'var(--text-muted)',
          bg: 'rgba(0,0,0,0.04)',
          border: 'var(--card-border)',
          tagline: '',
        };
        const ps    = byBrand[brandKey];
        const label = brandKey === '__outros__' ? 'Sem Marca' : brandKey;

        return (
          <div key={brandKey} className="card overflow-hidden" style={{ padding: 0 }}>
            {/* Brand header */}
            <div className="flex items-center gap-3 px-5 py-4"
                 style={{ background: cfg.bg, borderBottom: `1px solid ${typeof cfg.border === 'string' && cfg.border.startsWith('var') ? 'var(--card-border)' : `${cfg.border}30`}` }}>
              <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: cfg.border }} />
              <div className="flex-1">
                <p className="font-bold text-base" style={{ color: cfg.color }}>{label}</p>
                {cfg.tagline && (
                  <p className="text-xs mt-0.5" style={{ color: cfg.color, opacity: 0.6 }}>{cfg.tagline}</p>
                )}
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{ background: `${cfg.border}20`, color: cfg.color }}>
                {ps.length} item{ps.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Products */}
            <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
              {ps.map(product => {
                const stock   = getStock(product);
                const isDirty = pending[product.id] !== undefined;
                const isSav   = saving[product.id];
                const isSaved = saved[product.id];
                const isLow   = stock > 0 && stock <= 5;
                const isOut   = stock === 0;

                return (
                  <div key={product.id} className="flex items-center gap-4 px-5 py-3.5">
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                         style={{ background: cfg.bg, border: `1px solid ${cfg.border}25` }}>
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} style={{ color: cfg.border }} />
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {product.name}
                      </p>
                      <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                        {product.category} · {fmt(product.price_promotion ?? product.price_normal)}
                        {product.status === 'inactive' && (
                          <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">inativo</span>
                        )}
                      </p>
                    </div>

                    {/* Status dot */}
                    {(isOut || isLow) && (
                      <AlertTriangle size={14} className={isOut ? 'text-red-500' : 'text-amber-500'} />
                    )}

                    {/* Stock adjuster */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => adjust(product.id, stock, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={stock}
                        onChange={e => setVal(product.id, e.target.value)}
                        className="input w-16 text-center text-sm font-bold py-1.5"
                        style={{
                          borderColor: isDirty ? cfg.border : undefined,
                          color: isOut ? '#EF4444' : isLow ? '#F59E0B' : 'var(--text-primary)',
                        }}
                      />
                      <button
                        onClick={() => adjust(product.id, stock, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => saveStock(product)}
                      disabled={!isDirty || isSav}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        background: isSaved ? 'rgba(16,185,129,0.12)' : isDirty ? `${cfg.border}20` : 'transparent',
                        color: isSaved ? '#10B981' : isDirty ? cfg.border : 'transparent',
                        cursor: isDirty ? 'pointer' : 'default',
                      }}
                      title={isDirty ? 'Salvar alteração' : ''}
                    >
                      {isSav
                        ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                               style={{ borderColor: cfg.border, borderTopColor: 'transparent' }} />
                        : isSaved
                          ? <CheckCircle2 size={16} />
                          : <Save size={14} />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {products.length === 0 && (
        <div className="card text-center py-16">
          <Package size={40} className="mx-auto mb-3 opacity-20 text-brand-rose" />
          <p style={{ color: 'var(--text-muted)' }}>Nenhum produto cadastrado</p>
        </div>
      )}
    </div>
  );
}
