import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, ImageOff, Package } from 'lucide-react';
import api from '../services/api';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_normal: number;
  price_promotion: number | null;
  image_url: string | null;
  stock: number;
  status: 'active' | 'inactive';
}

const CATEGORIES = ['maquiagem', 'skincare', 'cabelo', 'corpo', 'perfumes', 'unhas', 'outros'];
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface ProductForm {
  name: string; description: string; category: string;
  price_normal: string; price_promotion: string; image_url: string;
  stock: string; status: 'active' | 'inactive';
}

const emptyForm: ProductForm = {
  name: '', description: '', category: 'maquiagem',
  price_normal: '', price_promotion: '', image_url: '',
  stock: '0', status: 'active'
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('q', search);
      if (category) params.set('category', category);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal('create'); setError(''); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description || '', category: p.category,
      price_normal: String(p.price_normal), price_promotion: String(p.price_promotion || ''),
      image_url: p.image_url || '', stock: String(p.stock), status: p.status
    });
    setEditing(p); setModal('edit'); setError('');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const body = {
        ...form,
        price_normal: parseFloat(form.price_normal),
        price_promotion: form.price_promotion ? parseFloat(form.price_promotion) : null,
        stock: parseInt(form.stock),
        image_url: form.image_url || null,
        description: form.description || null
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

  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-dark">Produtos</h2>
          <p className="text-gray-400 text-sm mt-1">{products.length} produto(s) encontrado(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="input pl-10"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input sm:w-48">
            <option value="">Todas categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Produto</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Categoria</th>
                  <th className="pb-3 font-medium">Preço</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Estoque</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-rose-light flex-shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff size={16} className="text-brand-rose/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-brand-dark truncate max-w-[160px]">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="badge bg-brand-rose-light text-brand-rose capitalize">{p.category}</span>
                    </td>
                    <td className="py-3">
                      <div>
                        {p.price_promotion && (
                          <p className="text-xs text-gray-400 line-through">{fmt(p.price_normal)}</p>
                        )}
                        <p className="font-semibold text-brand-rose">
                          {fmt(p.price_promotion ?? p.price_normal)}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 hidden sm:table-cell">
                      <span className={p.stock === 0 ? 'text-red-500 font-semibold' : 'text-brand-dark'}>
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
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-brand-rose-light hover:text-brand-rose transition-colors text-gray-400"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-display font-bold text-lg text-brand-dark">
                {modal === 'create' ? 'Novo Produto' : 'Editar Produto'}
              </h3>
              <button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1.5">Nome *</label>
                  <input value={form.name} onChange={e => f('name', e.target.value)} className="input" placeholder="Nome do produto" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1.5">Descrição</label>
                  <textarea value={form.description} onChange={e => f('description', e.target.value)} className="input resize-none h-20" placeholder="Descrição do produto" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1.5">Categoria *</label>
                    <select value={form.category} onChange={e => f('category', e.target.value)} className="input capitalize">
                      {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1.5">Status</label>
                    <select value={form.status} onChange={e => f('status', e.target.value)} className="input">
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1.5">Preço Normal *</label>
                    <input type="number" step="0.01" min="0" value={form.price_normal} onChange={e => f('price_normal', e.target.value)} className="input" placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1.5">Preço Promoção</label>
                    <input type="number" step="0.01" min="0" value={form.price_promotion} onChange={e => f('price_promotion', e.target.value)} className="input" placeholder="0,00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1.5">Estoque *</label>
                    <input type="number" min="0" value={form.stock} onChange={e => f('stock', e.target.value)} className="input" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1.5">URL da Imagem</label>
                  <input value={form.image_url} onChange={e => f('image_url', e.target.value)} className="input" placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
