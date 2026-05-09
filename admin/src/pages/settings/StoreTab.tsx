import { useState, FormEvent, useRef } from 'react';
import { Save, Store, Image, Link, Upload } from 'lucide-react';
import api from '../../services/api';

interface StoreForm {
  store_name: string;
  address: string;
  logo_url: string;
  banner_url: string;
  instagram_url: string;
  facebook_url: string;
}

interface Props {
  initial: StoreForm;
}

const feedback = {
  success: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399' },
  error:   { background: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.3)',  color: '#F87171' },
};

export default function StoreTab({ initial }: Props) {
  const [form, setForm] = useState<StoreForm>(initial);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const f = (k: keyof StoreForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleImageFile = (file: File, field: 'logo_url' | 'banner_url') => {
    if (file.size > 2 * 1024 * 1024) { setError('Imagem maior que 2MB'); return; }
    const reader = new FileReader();
    reader.onload = e => f(field, e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.put('/config', {
        store_name: form.store_name,
        address: form.address || null,
        logo_url: form.logo_url || null,
        banner_url: form.banner_url || null,
        instagram_url: form.instagram_url || null,
        facebook_url: form.facebook_url || null,
      });
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
          ✓ Salvo com sucesso!
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={feedback.error}>{error}</div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Store size={18} className="text-brand-rose" />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Informações Gerais</h3>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nome da Loja</label>
          <input value={form.store_name} onChange={e => f('store_name', e.target.value)} className="input" placeholder="Minha Beauty Store" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Endereço</label>
          <input value={form.address} onChange={e => f('address', e.target.value)} className="input" placeholder="Rua, Número, Cidade - Estado" />
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Image size={18} className="text-brand-rose" />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Imagens</h3>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Logo da Loja</label>
          <div className="flex gap-2">
            <input
              value={form.logo_url.startsWith('data:') ? '' : form.logo_url}
              onChange={e => f('logo_url', e.target.value)}
              className="input flex-1"
              placeholder="https://... ou faça upload"
            />
            <button type="button" onClick={() => logoRef.current?.click()} className="btn-secondary px-3 flex items-center gap-1.5 flex-shrink-0">
              <Upload size={15} /> Upload
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'logo_url')} />
          </div>
          {form.logo_url && (
            <img src={form.logo_url} alt="Logo" className="mt-2 h-16 object-contain rounded-xl"
                 style={{ border: '1px solid var(--card-border)' }} />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Banner Principal</label>
          <div className="flex gap-2">
            <input
              value={form.banner_url.startsWith('data:') ? '' : form.banner_url}
              onChange={e => f('banner_url', e.target.value)}
              className="input flex-1"
              placeholder="https://..."
            />
            <button type="button" onClick={() => bannerRef.current?.click()} className="btn-secondary px-3 flex items-center gap-1.5 flex-shrink-0">
              <Upload size={15} /> Upload
            </button>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'banner_url')} />
          </div>
          {form.banner_url && (
            <img src={form.banner_url} alt="Banner" className="mt-2 h-24 w-full object-cover rounded-xl"
                 style={{ border: '1px solid var(--card-border)' }} />
          )}
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Link size={18} className="text-brand-rose" />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Redes Sociais</h3>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Instagram</label>
          <input value={form.instagram_url} onChange={e => f('instagram_url', e.target.value)} className="input" placeholder="https://instagram.com/suapage" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Facebook</label>
          <input value={form.facebook_url} onChange={e => f('facebook_url', e.target.value)} className="input" placeholder="https://facebook.com/suapage" />
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving
          ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <><Save size={18} /> Salvar Loja</>
        }
      </button>
    </form>
  );
}
