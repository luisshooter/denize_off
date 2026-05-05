import { useEffect, useState, FormEvent } from 'react';
import { Save, Store, MessageCircle, Image, Link, KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

interface ConfigForm {
  store_name: string;
  whatsapp_number: string;
  default_message: string;
  logo_url: string;
  banner_url: string;
  instagram_url: string;
  facebook_url: string;
  address: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const empty: ConfigForm = {
  store_name: '', whatsapp_number: '', default_message: '',
  logo_url: '', banner_url: '', instagram_url: '', facebook_url: '', address: ''
};

const emptyPwd: PasswordForm = { current_password: '', new_password: '', confirm_password: '' };

export default function Settings() {
  const [form, setForm] = useState<ConfigForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [pwdForm, setPwdForm] = useState<PasswordForm>(emptyPwd);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    api.get('/config/admin').then(({ data }) => {
      setForm({
        store_name: data.store_name || '',
        whatsapp_number: data.whatsapp_number || '',
        default_message: data.default_message || '',
        logo_url: data.logo_url || '',
        banner_url: data.banner_url || '',
        instagram_url: data.instagram_url || '',
        facebook_url: data.facebook_url || '',
        address: data.address || ''
      });
    }).finally(() => setLoading(false));
  }, []);

  const f = (k: keyof ConfigForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const p = (k: keyof PasswordForm, v: string) => setPwdForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.put('/config', {
        ...form,
        whatsapp_number: form.whatsapp_number.replace(/\D/g, '') || null,
        logo_url: form.logo_url || null,
        banner_url: form.banner_url || null,
        instagram_url: form.instagram_url || null,
        facebook_url: form.facebook_url || null,
        address: form.address || null
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError(''); setPwdSuccess(false);

    if (pwdForm.new_password.length < 8) {
      setPwdError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdError('As senhas não coincidem');
      return;
    }

    setPwdSaving(true);
    try {
      await api.put('/auth/change-password', {
        current_password: pwdForm.current_password,
        new_password: pwdForm.new_password
      });
      setPwdSuccess(true);
      setPwdForm(emptyPwd);
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: any) {
      setPwdError(err.response?.data?.error || 'Erro ao trocar senha');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-dark">Configurações</h2>
        <p className="text-gray-400 text-sm mt-1">Personalize sua loja</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          ✓ Configurações salvas com sucesso!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Store size={18} className="text-brand-rose" />
            <h3 className="font-semibold text-brand-dark">Informações da Loja</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">Nome da Loja</label>
            <input value={form.store_name} onChange={e => f('store_name', e.target.value)} className="input" placeholder="Minha Beauty Store" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">Endereço</label>
            <input value={form.address} onChange={e => f('address', e.target.value)} className="input" placeholder="Rua, Número, Cidade - Estado" />
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={18} className="text-green-500" />
            <h3 className="font-semibold text-brand-dark">WhatsApp</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              Número do WhatsApp
              <span className="text-gray-400 font-normal ml-2 text-xs">Somente dígitos (ex: 5511999999999)</span>
            </label>
            <input
              value={form.whatsapp_number}
              onChange={e => f('whatsapp_number', e.target.value.replace(/\D/g, ''))}
              className="input"
              placeholder="5511999999999"
              maxLength={15}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">Mensagem Padrão</label>
            <textarea
              value={form.default_message}
              onChange={e => f('default_message', e.target.value)}
              className="input resize-none h-20"
              placeholder="Olá! 👋 Gostaria de fazer um pedido."
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{form.default_message.length}/500</p>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Image size={18} className="text-brand-rose" />
            <h3 className="font-semibold text-brand-dark">Imagens</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">URL do Logo</label>
            <input value={form.logo_url} onChange={e => f('logo_url', e.target.value)} className="input" placeholder="https://..." />
            {form.logo_url && (
              <img src={form.logo_url} alt="Preview logo" className="mt-2 h-12 object-contain rounded-lg border border-gray-100" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">URL do Banner Principal</label>
            <input value={form.banner_url} onChange={e => f('banner_url', e.target.value)} className="input" placeholder="https://..." />
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Link size={18} className="text-brand-rose" />
            <h3 className="font-semibold text-brand-dark">Redes Sociais</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">Instagram</label>
            <input value={form.instagram_url} onChange={e => f('instagram_url', e.target.value)} className="input" placeholder="https://instagram.com/suapage" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">Facebook</label>
            <input value={form.facebook_url} onChange={e => f('facebook_url', e.target.value)} className="input" placeholder="https://facebook.com/suapage" />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><Save size={18} /> Salvar Configurações</>
          }
        </button>
      </form>

      {/* Troca de senha */}
      <form onSubmit={handlePasswordChange} className="space-y-5">
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={18} className="text-brand-rose" />
            <h3 className="font-semibold text-brand-dark">Alterar Senha</h3>
          </div>

          {pwdSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
              ✓ Senha alterada com sucesso!
            </div>
          )}
          {pwdError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{pwdError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">Senha Atual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={pwdForm.current_password}
                onChange={e => p('current_password', e.target.value)}
                className="input pr-10"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">Nova Senha</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={pwdForm.new_password}
                onChange={e => p('new_password', e.target.value)}
                className="input pr-10"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">Confirmar Nova Senha</label>
            <input
              type="password"
              value={pwdForm.confirm_password}
              onChange={e => p('confirm_password', e.target.value)}
              className="input"
              placeholder="Repita a nova senha"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={pwdSaving}>
            {pwdSaving
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><KeyRound size={18} /> Alterar Senha</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
