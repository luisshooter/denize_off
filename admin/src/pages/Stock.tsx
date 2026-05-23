import { useEffect, useState, useCallback } from 'react';
import { Package, RefreshCw, Minus, Plus, Save, CheckCircle2, AlertTriangle, Archive, Layers } from 'lucide-react';
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
const fmt = (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Tab = 'all' | 'out';

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [pending, setPending]   = useState<Record<string, number>>({});
  const [saving, setSaving]     = useState<Record<string, boolean>>({});
  const [saved,  setSaved]      = useState<Record<string, boolean>>({});
  const [tab,    setTab]        = useState<Tab>('all');

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

  // For out-of-stock tab: only include groups/products with stock = 0
  const displayByBrand: Record<string, Product[]> = tab === 'out'
    ? Object.fromEntries(
        Object.entries(byBrand)
          .map(([k, ps]) => [k, ps.filter(p => getStock(p) === 0)])
          .filter(([, ps]) => (ps as Product[]).length > 0)
      )
    : byBrand;

  const otherBrands = Object.keys(displayByBrand).filter(
    k => !BRAND_ORDER.includes(k) && k !== '__outros__'
  ).sort();
  const groupOrder = [...BRAND_ORDER, ...otherBrands, '__outros__'];

  // Only show brand summary cards for brands that actually have products
  const activeSummaryBrands = BRAND_ORDER.filter(b => (byBrand[b]?.length ?? 0) > 0);

  // Global stats
  const totalProducts  = products.length;
  const totalInStock   = products.filter(p => getStock(p) > 0).length;
  const lowStockCount  = products.filter(p => getStock(p) > 0 && getStock(p) <= 5).length;
  const outStockCount  = products.filter(p => getStock(p) === 0).length;

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Controle de Estoque
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Estoque decrementado automaticamente ao confirmar pedido
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm flex-shrink-0"
        >
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {/* Global stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      value: totalProducts, color: 'var(--text-primary)', icon: Layers },
          { label: 'Em estoque', value: totalInStock,  color: '#10B981',             icon: CheckCircle2 },
          { label: 'Estoque baixo', value: lowStockCount, color: '#F59E0B',          icon: AlertTriangle },
          { label: 'Sem estoque',   value: outStockCount,  color: '#EF4444',         icon: Archive },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card flex items-center gap-3 py-3 px-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: `${color}15` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Brand summary cards — only brands that have products */}
      {activeSummaryBrands.length > 0 && (
        <div className={`grid grid-cols-1 gap-4 ${
          activeSummaryBrands.length === 1 ? '' :
          activeSummaryBrands.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
        }`}>
          {activeSummaryBrands.map(brand => {
            const cfg = BRAND_CFG[brand];
            const ps  = byBrand[brand] || [];
            const totalUnits = ps.reduce((s, p) => s + getStock(p), 0);
            const low  = ps.filter(p => getStock(p) > 0 && getStock(p) <= 5).length;
            const out  = ps.filter(p => getStock(p) === 0).length;

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
                  {low > 0 && (
                    <div>
                      <p className="font-bold text-xl text-amber-500">{low}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>baixo</p>
                    </div>
                  )}
                  {out > 0 && (
                    <div>
                      <p className="font-bold text-xl text-red-500">{out}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>esgotado</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
           style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
        <button
          onClick={() => setTab('all')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={tab === 'all'
            ? { background: 'var(--card-bg)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,.12)' }
            : { color: 'var(--text-muted)' }}
        >
          Todos os produtos
          <span className="ml-1.5 text-xs opacity-60">({totalProducts})</span>
        </button>
        <button
          onClick={() => setTab('out')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
          style={tab === 'out'
            ? { background: 'var(--card-bg)', color: '#EF4444', boxShadow: '0 1px 3px rgba(0,0,0,.12)' }
            : { color: 'var(--text-muted)' }}
        >
          <Archive size={13} />
          Sem estoque
          {outStockCount > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: tab === 'out' ? 'rgba(239,68,68,.12)' : 'rgba(239,68,68,.1)', color: '#EF4444' }}>
              {outStockCount}
            </span>
          )}
        </button>
      </div>

      {/* Empty state for out-of-stock tab */}
      {tab === 'out' && outStockCount === 0 && (
        <div className="card text-center py-14">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500 opacity-60" />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Todos os produtos têm estoque!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Nenhum produto esgotado no momento</p>
        </div>
      )}

      {/* Product groups */}
      {groupOrder.filter(k => (displayByBrand[k]?.length ?? 0) > 0).map(brandKey => {
        const cfg = BRAND_CFG[brandKey] ?? {
          label: brandKey === '__outros__' ? 'Sem Marca' : brandKey,
          color: '#64748b',
          bg: 'rgba(100,116,139,0.06)',
          border: '#94a3b8',
          tagline: '',
        };
        const ps    = displayByBrand[brandKey];
        const label = brandKey === '__outros__' ? 'Sem Marca' : brandKey;

        return (
          <div key={brandKey} className="card overflow-hidden" style={{ padding: 0 }}>
            {/* Brand header */}
            <div className="flex items-center gap-3 px-5 py-3.5"
                 style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}25` }}>
              <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: cfg.border }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: cfg.color }}>{label}</p>
                {cfg.tagline && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: cfg.color, opacity: 0.55 }}>{cfg.tagline}</p>
                )}
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: `${cfg.border}18`, color: cfg.color }}>
                {ps.length} item{ps.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Product rows */}
            <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
              {ps.map(product => {
                const stock   = getStock(product);
                const isDirty = pending[product.id] !== undefined;
                const isSav   = saving[product.id];
                const isSaved = saved[product.id];
                const isLow   = stock > 0 && stock <= 5;
                const isOut   = stock === 0;

                return (
                  <div key={product.id}
                       className="flex items-center gap-3 px-5 py-3 transition-colors"
                       style={{ background: isDirty ? `${cfg.border}06` : undefined }}>

                    {/* Thumbnail */}
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
                         style={{ background: cfg.bg, border: `1px solid ${cfg.border}20` }}>
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Package size={14} style={{ color: cfg.border }} />
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                          {product.category}
                        </p>
                        <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>·</span>
                        <p className="text-xs font-medium" style={{ color: cfg.color }}>
                          {fmt(Number(product.price_promotion ?? product.price_normal))}
                        </p>
                        {product.status === 'inactive' && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(100,116,139,.12)', color: '#64748b' }}>
                            inativo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock status icon */}
                    <div className="w-5 flex-shrink-0 flex justify-center">
                      {(isOut || isLow) && (
                        <AlertTriangle size={13} className={isOut ? 'text-red-500' : 'text-amber-400'} />
                      )}
                    </div>

                    {/* Stock adjuster — touch-friendly (min 36px) */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => adjust(product.id, stock, -1)}
                        className="flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90 cursor-pointer"
                        style={{
                          minWidth: 36, minHeight: 36,
                          background: 'rgba(212,80,159,0.07)',
                          border: '1px solid rgba(212,80,159,0.18)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={stock}
                        onChange={e => setVal(product.id, e.target.value)}
                        className="input text-center text-sm font-bold"
                        style={{
                          width: 52,
                          minHeight: 36,
                          padding: '0 4px',
                          borderColor: isDirty ? cfg.border : undefined,
                          color: isOut ? '#EF4444' : isLow ? '#F59E0B' : 'var(--text-primary)',
                        }}
                      />
                      <button
                        onClick={() => adjust(product.id, stock, 1)}
                        className="flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90 cursor-pointer"
                        style={{
                          minWidth: 36, minHeight: 36,
                          background: 'rgba(212,80,159,0.07)',
                          border: '1px solid rgba(212,80,159,0.18)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Save button — touch-friendly */}
                    <button
                      onClick={() => saveStock(product)}
                      disabled={!isDirty || isSav}
                      className="flex items-center justify-center rounded-xl transition-all duration-150 flex-shrink-0 active:scale-90"
                      style={{
                        minWidth: 36, minHeight: 36,
                        background: isSaved ? 'rgba(16,185,129,0.12)' : isDirty ? `${cfg.border}20` : 'transparent',
                        color: isSaved ? '#10B981' : isDirty ? cfg.border : 'transparent',
                        cursor: isDirty ? 'pointer' : 'default',
                        border: isDirty && !isSaved ? `1px solid ${cfg.border}35` : '1px solid transparent',
                      }}
                      title={isDirty ? 'Salvar alteração' : ''}
                    >
                      {isSav
                        ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                               style={{ borderColor: cfg.border, borderTopColor: 'transparent' }} />
                        : isSaved
                          ? <CheckCircle2 size={15} />
                          : <Save size={13} />
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
