import { useState, FormEvent } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const empty: PasswordForm = { current_password: '', new_password: '', confirm_password: '' };

const feedback = {
  success: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399' },
  error:   { background: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.3)',  color: '#F87171' },
};

export default function AccountTab() {
  const [form, setForm] = useState<PasswordForm>(empty);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const f = (k: keyof PasswordForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (form.new_password.length < 8) { setError('A nova senha deve ter pelo menos 8 caracteres'); return; }
    if (form.new_password !== form.confirm_password) { setError('As senhas não coincidem'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setForm(empty);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao trocar senha');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={feedback.success}>
          ✓ Senha alterada! Você será desconectado nos outros dispositivos.
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={feedback.error}>{error}</div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={18} className="text-brand-rose" />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Alterar Senha</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Senha Atual</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={form.current_password}
              onChange={e => f('current_password', e.target.value)}
              className="input pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Nova Senha</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={form.new_password}
              onChange={e => f('new_password', e.target.value)}
              className="input pr-10"
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNew(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Confirmar Nova Senha</label>
          <input
            type="password"
            value={form.confirm_password}
            onChange={e => f('confirm_password', e.target.value)}
            className="input"
            placeholder="Repita a nova senha"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><KeyRound size={18} /> Alterar Senha</>
          }
        </button>
      </div>
    </form>
  );
}
