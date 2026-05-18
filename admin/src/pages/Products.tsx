import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, X, ImageOff, Package, Upload } from 'lucide-react';
import api from '../services/api';
import { PaymentIcon, type PaymentMethod } from './settings/PaymentsTab';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  brand: string | null;
  price_normal: number;
  price_promotion: number | null;
  image_url: string | null;
  stock: number;
  status: 'active' | 'inactive';
  payment_method_ids: string[] | null;
}

const DEFAULT_CATEGORIES = ['maquiagem', 'skincare', 'cabelo', 'corpo', 'perfumes', 'unhas', 'outros'];
const BRANDS = ['Natura', 'Avon', 'Farmasi', 'Outros'];
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const BRAND_BADGE: Record<string, { bg: string; color: string }> = {
  Natura:  { bg: 'rgba(0,135,97,0.12)',   color: '#005240' },
  Avon:    { bg: 'rgba(201,24,128,0.12)', color: '#7B0044' },
  Farmasi: { bg: 'rgba(91,43,142,0.12)',  color: '#3D1A6E' },
};

interface ProductForm {
  name: string; description: string; category: string; brand: string;
  price_normal: string; price_promotion: string; image_url: string;
  stock: string; status: 'active' | 'inactive';
  payment_method_ids: string[];
}

const emptyForm: ProductForm = {
  name: '', description: '', category: 'maquiagem', brand: '',
  price_normal: '', price_promotion: '', image_url: '',
  stock: '0', status: 'active', payment_method_ids: []
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [storePayments, setStorePayments] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/config').then(r => {
      setStorePayments(Array.isArray(r.data.payment_methods)
        ? r.data.payment_methods.filter((m: PaymentMethod) => m.enabled) : []);
      if (Array.isArray(r.data.categories) && r.data.categories.length > 0) {
        setCategories(r.data.categories);
      }
    }).catch(() => {});
  }, []);

  const handleImageFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) { setError('Imagem muito grande. Máximo 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => f('image_url', e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      if (category) params.set('category', category);
      if (brandFilter) params.set('brand', brandFilter);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, [search, category, brandFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => { setForm({ ...emptyForm, category: categories[0] ?? 'maquiagem' }); setEditing(null); setModal('create'); setError(''); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description || '', category: p.category, brand: p.brand || '',
      price_normal: String(p.price_normal), price_promotion: String(p.price_promotion || ''),
      image_url: p.image_url || '', stock: String(p.stock), status: p.status,
      payment_method_ids: p.payment_method_ids || []
    });
    setEditing(p); setModal('edit'); setError('');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const body = {
        ...form,
        brand: form.brand || null,
        price_normal: parseFloat(form.price_normal),
        price_promotion: form.price_promotion ? parseFloat(form.price_promotion) : null,
        stock: parseInt(form.stock),
        image_url: form.image_url || null,
        description: form.description || null,
        payment_method_ids: form.payment_method_ids.length ? form.payment_method_ids : null
      };
      if (modal === 'edit' && editing) {
        await api.put(`/products/${editing.id}`, body);
      } else {
        await api.post('/products', body);
      }
      setModal(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remover "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover produto');
    }
  };

  const f = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Produtos</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{products.length} produto(s) encontrado(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="input pl-10"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input sm:w-44">
            <option value="">Todas as categorias</option>
            {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="input sm:w-36">
            <option value="">Todas as marcas</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--card-border)' }}>
                  <th className="pb-3 font-medium">Produto</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Marca / Categoria</th>
                  <th className="pb-3 font-medium">Preço</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Estoque</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {products.map(p => {
                  const brandStyle = p.brand ? BRAND_BADGE[p.brand] : null;
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(212,80,159,0.08)' }}>
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageOff size={16} className="text-brand-rose/40" />
                              </div>
                            )}
                          </div>
                          <p className="font-medium truncate max-w-[160px]" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          {p.brand && brandStyle && (
                            <span className="badge text-[10px] font-bold self-start"
                              style={{ background: brandStyle.bg, color: brandStyle.color }}>
                              {p.brand}
                            </span>
                          )}
                          <span className="badge bg-brand-rose-light text-brand-rose capitalize text-[10px] self-start">{p.category}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          {p.price_promotion && (
                            <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{fmt(p.price_normal)}</p>
                          )}
                          <p className="font-semibold text-brand-rose">
                            {fmt(p.price_promotion ?? p.price_normal)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <span className={p.stock === 0 ? 'text-red-500 font-semibold' : ''} style={{ color: p.stock === 0 ? undefined : 'var(--text-primary)' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`badge ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)}
                            className="p-2 rounded-lg transition-colors hover:bg-brand-rose-light hover:text-brand-rose"
                            style={{ color: 'var(--text-muted)' }}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 rounded-lg transition-colors hover:bg-red-50 hover:text-red-500"
                            style={{ color: 'var(--text-muted)' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
               style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {modal === 'create' ? 'Novo Produto' : 'Editar Produto'}
              </h3>
              <button onClick={() => setModal(null)}
                className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nome *</label>
                <input value={form.name} onChange={e => f('name', e.target.value)} className="input" placeholder="Nome do produto" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Descrição</label>
                <textarea value={form.description} onChange={e => f('description', e.target.value)}
                  className="input resize-none h-20" placeholder="Descrição do produto" />
              </div>

              {/* Category | Brand | Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Categoria *</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)} className="input capitalize">
                    {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Marca</label>
                  <select value={form.brand} onChange={e => f('brand', e.target.value)} className="input">
                    <option value="">Sem marca</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Status</label>
                  <select value={form.status} onChange={e => f('status', e.target.value as 'active' | 'inactive')} className="input">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Price Normal | Price Promotion */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Preço Normal *</label>
                  <input type="number" step="0.01" min="0" value={form.price_normal}
                    onChange={e => f('price_normal', e.target.value)} className="input" placeholder="0,00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Preço em Promoção
                    <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                  </label>
                  <input type="number" step="0.01" min="0" value={form.price_promotion}
                    onChange={e => f('price_promotion', e.target.value)} className="input" placeholder="Deixe vazio se não houver" />
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Estoque *</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={e => f('stock', e.target.value)} className="input" placeholder="0" />
                </div>
              </div>

              {storePayments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Formas de Pagamento
                    <span className="font-normal ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>Deixe vazio para aceitar todas</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {storePayments.map(m => {
                      const selected = form.payment_method_ids.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            const ids = selected
                              ? form.payment_method_ids.filter(id => id !== m.id)
                              : [...form.payment_method_ids, m.id];
                            f('payment_method_ids', ids);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            selected ? 'bg-brand-rose text-white border-brand-rose' : 'border-gray-200 hover:border-brand-rose'
                          }`}
                          style={{ color: selected ? undefined : 'var(--text-muted)' }}
                        >
                          <PaymentIcon type={m.type} size={13} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                  {form.payment_method_ids.length === 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Aceitando todos os métodos da loja</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Imagem do Produto</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={form.image_url.startsWith('data:') ? '' : form.image_url}
                      onChange={e => f('image_url', e.target.value)}
                      className="input flex-1"
                      placeholder="Cole uma URL (https://...)"
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary px-3 flex-shrink-0 flex items-center gap-1.5">
                      <Upload size={15} /> Upload
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
                  </div>
                  {form.image_url && (
                    <div className="relative inline-block">
                      <img src={form.image_url} alt="Preview"
                        className="h-24 rounded-xl object-cover border"
                        style={{ borderColor: 'var(--card-border)' }}
                        onError={() => f('image_url', '')} />
                      <button type="button" onClick={() => f('image_url', '')}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
                {saving
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
