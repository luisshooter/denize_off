import { useState } from 'react';
import { Save, Plus, Trash2, CreditCard, Banknote, Smartphone, Wallet, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';

export interface PaymentMethod {
  id: string;
  type: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'other';
  label: string;
  enabled: boolean;
  installments?: number;
  min_installment?: number;
}

interface Props {
  initial: PaymentMethod[];
}

const TYPE_OPTIONS = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'other', label: 'Outro' },
];

const feedback = {
  success: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399' },
  error:   { background: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.3)',  color: '#F87171' },
};

export function PaymentIcon({ type, size = 18 }: { type: PaymentMethod['type']; size?: number }) {
  switch (type) {
    case 'pix': return <Smartphone size={size} className="text-green-400" />;
    case 'credit_card': return <CreditCard size={size} className="text-blue-400" />;
    case 'debit_card': return <CreditCard size={size} className="text-indigo-400" />;
    case 'cash': return <Banknote size={size} className="text-emerald-400" />;
    default: return <Wallet size={size} style={{ color: 'var(--text-muted)' }} />;
  }
}

export function installmentLabel(method: PaymentMethod, price: number): string | null {
  if (method.type !== 'credit_card' || !method.installments || method.installments <= 1) return null;
  const min = method.min_installment || 10;
  const maxX = Math.min(method.installments, Math.floor(price / min));
  if (maxX <= 1) return null;
  return `até ${maxX}x de ${(price / maxX).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
}

const emptyMethod = (): PaymentMethod => ({
  id: `pm_${Date.now()}`,
  type: 'pix',
  label: '',
  enabled: true,
});

export default function PaymentsTab({ initial }: Props) {
  const [methods, setMethods] = useState<PaymentMethod[]>(initial);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<PaymentMethod>(emptyMethod());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id: string) =>
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));

  const remove = (id: string) =>
    setMethods(prev => prev.filter(m => m.id !== id));

  const d = (k: keyof PaymentMethod, v: any) => setDraft(p => ({ ...p, [k]: v }));

  const confirmAdd = () => {
    if (!draft.label.trim()) return;
    const label = draft.label.trim() || TYPE_OPTIONS.find(t => t.value === draft.type)?.label || draft.type;
    setMethods(prev => [...prev, { ...draft, label }]);
    setDraft(emptyMethod());
    setAdding(false);
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.put('/config', { payment_methods: methods });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const EXAMPLE_PRICE = 199.90;

  return (
    <div className="space-y-5">
      {success && <div className="px-4 py-3 rounded-xl text-sm font-medium" style={feedback.success}>✓ Formas de pagamento salvas!</div>}
      {error && <div className="px-4 py-3 rounded-xl text-sm" style={feedback.error}>{error}</div>}

      <div className="card space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Formas de Pagamento Aceitas</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Exibidas nos cards de produto da vitrine</p>
          </div>
          <button
            onClick={() => { setDraft(emptyMethod()); setAdding(true); }}
            className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1.5"
          >
            <Plus size={15} /> Adicionar
          </button>
        </div>

        {methods.length === 0 && !adding && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            Nenhuma forma de pagamento cadastrada. Clique em "Adicionar".
          </div>
        )}

        {methods.map(m => (
          <div key={m.id}
               className="flex items-center gap-3 p-3 rounded-xl transition-colors"
               style={{
                 background: m.enabled ? 'var(--card-bg)' : 'rgba(0,0,0,0.04)',
                 border: '1px solid var(--card-border)',
                 opacity: m.enabled ? 1 : 0.6,
               }}>
            <PaymentIcon type={m.type} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
              {m.type === 'credit_card' && m.installments && m.installments > 1 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {installmentLabel(m, EXAMPLE_PRICE)
                    ? `Ex: ${installmentLabel(m, EXAMPLE_PRICE)} (p/ R$ ${EXAMPLE_PRICE.toFixed(2)})`
                    : `Até ${m.installments}x`}
                </p>
              )}
            </div>
            <button onClick={() => toggle(m.id)} style={{ color: 'var(--text-muted)' }} title={m.enabled ? 'Desativar' : 'Ativar'}>
              {m.enabled
                ? <ToggleRight size={22} className="text-green-400" />
                : <ToggleLeft size={22} />
              }
            </button>
            <button onClick={() => remove(m.id)} className="p-1 transition-colors hover:text-red-400" style={{ color: 'var(--text-muted)' }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {adding && (
          <div className="rounded-xl p-4 space-y-3"
               style={{ border: '1px solid rgba(196,154,108,0.3)', background: 'rgba(196,154,108,0.06)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nova forma de pagamento</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Tipo</label>
                <select
                  value={draft.type}
                  onChange={e => {
                    const type = e.target.value as PaymentMethod['type'];
                    const label = TYPE_OPTIONS.find(t => t.value === type)?.label || '';
                    setDraft(p => ({ ...p, type, label }));
                  }}
                  className="input text-sm"
                >
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nome exibido</label>
                <input value={draft.label} onChange={e => d('label', e.target.value)} className="input text-sm" placeholder="Ex: PIX" />
              </div>
            </div>
            {draft.type === 'credit_card' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Máx. parcelas</label>
                  <input type="number" min={1} max={48} value={draft.installments || ''}
                    onChange={e => d('installments', parseInt(e.target.value) || undefined)} className="input text-sm" placeholder="Ex: 12" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Valor mín. parcela (R$)</label>
                  <input type="number" min={1} step={0.01} value={draft.min_installment || ''}
                    onChange={e => d('min_installment', parseFloat(e.target.value) || undefined)} className="input text-sm" placeholder="Ex: 10.00" />
                </div>
                {draft.installments && draft.installments > 1 && (
                  <div className="col-span-2 text-xs px-3 py-2 rounded-lg"
                       style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                    Prévia: produto de R$ 199,90 → {installmentLabel({ ...draft } as PaymentMethod, 199.90) || 'à vista'}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={confirmAdd} disabled={!draft.label.trim()} className="btn-primary flex-1 py-1.5 text-sm">Confirmar</button>
              <button type="button" onClick={() => setAdding(false)} className="btn-secondary flex-1 py-1.5 text-sm">Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSave} className="btn-primary w-full" disabled={saving}>
        {saving
          ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <><Save size={18} /> Salvar Pagamentos</>
        }
      </button>
    </div>
  );
}
