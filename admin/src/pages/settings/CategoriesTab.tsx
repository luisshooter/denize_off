import { useState, FormEvent, KeyboardEvent } from 'react';
import { Save, Plus, X, RotateCcw, Tag } from 'lucide-react';
import api from '../../services/api';

const DEFAULT_CATEGORIES = ['maquiagem','skincare','cabelo','corpo','perfumes','unhas','outros'];

const feedback = {
  success: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399' },
  error:   { background: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.3)',  color: '#F87171' },
};

interface Props {
  initial: string[];
}

export default function CategoriesTab({ initial }: Props) {
  const [categories, setCategories] = useState<string[]>(
    initial.length > 0 ? initial : [...DEFAULT_CATEGORIES]
  );
  const [input, setInput]   = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState('');

  const normalize = (v: string) => v.trim().toLowerCase().replace(/\s+/g, ' ');

  const add = () => {
    const val = normalize(input);
    if (!val) return;
    if (categories.includes(val)) { setError(`"${val}" já existe`); return; }
    if (categories.length >= 30)  { setError('Máximo de 30 categorias'); return; }
    setCategories(prev => [...prev, val]);
    setInput('');
    setError('');
  };

  const remove = (cat: string) => {
    if (categories.length <= 1) return;
    setCategories(prev => prev.filter(c => c !== cat));
  };

  const restore = () => {
    const merged = [...DEFAULT_CATEGORIES];
    categories.forEach(c => { if (!merged.includes(c)) merged.push(c); });
    setCategories(merged);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (categories.length === 0) { setError('Adicione ao menos uma categoria'); return; }
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.put('/config', { categories });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={feedback.success}>
          ✓ Categorias salvas com sucesso!
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={feedback.error}>{error}</div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-brand-rose" />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Categorias de Produto
            </h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}>
            {categories.length} / 30
          </span>
        </div>

        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Estas categorias aparecem nos filtros da loja e no formulário de cadastro de produtos. Remover uma categoria não afeta os produtos já cadastrados com ela.
        </p>

        {/* Chip list */}
        <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
          {categories.map(cat => (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all"
              style={{ background: 'rgba(196,154,108,0.12)', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.25)' }}
            >
              {cat}
              <button
                type="button"
                onClick={() => remove(cat)}
                disabled={categories.length <= 1}
                className="rounded-full p-0.5 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Remover categoria"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {categories.length === 0 && (
            <span className="text-sm italic" style={{ color: 'var(--text-muted)' }}>Nenhuma categoria cadastrada</span>
          )}
        </div>

        {/* Add input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            onKeyDown={handleKey}
            placeholder="Nova categoria (ex: acessórios)"
            className="input flex-1"
            maxLength={60}
          />
          <button
            type="button"
            onClick={add}
            disabled={!input.trim()}
            className="btn-secondary flex items-center gap-1.5 px-4 flex-shrink-0 disabled:opacity-40"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        {/* Restore defaults */}
        <div className="pt-1 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button
            type="button"
            onClick={restore}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#C49A6C')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <RotateCcw size={13} />
            Restaurar categorias padrão
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving
          ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <><Save size={18} /> Salvar Categorias</>
        }
      </button>
    </form>
  );
}
