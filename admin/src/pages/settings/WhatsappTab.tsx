import { useState, FormEvent, useRef } from 'react';
import { Save, MessageCircle } from 'lucide-react';
import api from '../../services/api';

interface WhatsappForm {
  whatsapp_number: string;
  default_message: string;
  whatsapp_template_single: string;
  whatsapp_template_multiple: string;
}

interface Props {
  initial: WhatsappForm;
}

const DEFAULT_SINGLE = `🌸 *Olá! Aqui é {nome}* 😊\n\nVim pelo site e gostaria de encomendar:\n\n✨ *{produto}*\n📦 Quantidade: {quantidade} unidade(s)\n💵 Valor unitário: {preco_unitario}\n\n💰 *Total: {total}*\n\nPode me confirmar a disponibilidade? 🙏💕`;
const DEFAULT_MULTIPLE = `🌸 *Olá! Aqui é {nome}* 😊\n\nVim pelo site e gostaria de encomendar:\n\n{lista}\n\n💰 *Total: {total}*\n\nPode me confirmar a disponibilidade? 🙏💕`;

const TAGS_SINGLE = [
  { tag: '{produto}', desc: 'Nome do produto' },
  { tag: '{quantidade}', desc: 'Quantidade' },
  { tag: '{preco_unitario}', desc: 'Preço por unidade' },
  { tag: '{subtotal}', desc: 'Qty × preço' },
  { tag: '{total}', desc: 'Total do pedido' },
  { tag: '{nome}', desc: 'Nome do cliente' },
];

const TAGS_MULTIPLE = [
  { tag: '{lista}', desc: 'Lista completa de itens (auto-formatada)' },
  { tag: '{total}', desc: 'Total do pedido' },
  { tag: '{nome}', desc: 'Nome do cliente' },
];

const feedback = {
  success: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399' },
  error:   { background: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.3)',  color: '#F87171' },
};

function TagChip({ tag, desc, onInsert }: { tag: string; desc: string; onInsert: (tag: string) => void }) {
  return (
    <button
      type="button"
      title={desc}
      onClick={() => onInsert(tag)}
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono transition-colors"
      style={{
        background: 'rgba(196,154,108,0.12)',
        color: '#C49A6C',
        border: '1px solid rgba(196,154,108,0.25)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = '#C49A6C';
        (e.currentTarget as HTMLElement).style.color = '#fff';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,108,0.12)';
        (e.currentTarget as HTMLElement).style.color = '#C49A6C';
      }}
    >
      {tag}
    </button>
  );
}

export default function WhatsappTab({ initial }: Props) {
  const [form, setForm] = useState<WhatsappForm>({
    ...initial,
    whatsapp_template_single: initial.whatsapp_template_single || DEFAULT_SINGLE,
    whatsapp_template_multiple: initial.whatsapp_template_multiple || DEFAULT_MULTIPLE,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const singleRef = useRef<HTMLTextAreaElement>(null);
  const multiRef = useRef<HTMLTextAreaElement>(null);

  const f = (k: keyof WhatsappForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  const insertTag = (ref: React.RefObject<HTMLTextAreaElement>, field: keyof WhatsappForm, tag: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = form[field].slice(0, start) + tag + form[field].slice(end);
    f(field, newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.put('/config', {
        whatsapp_number: form.whatsapp_number.replace(/\D/g, '') || null,
        default_message: form.default_message || null,
        whatsapp_template_single: form.whatsapp_template_single || null,
        whatsapp_template_multiple: form.whatsapp_template_multiple || null,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const previewStyle: React.CSSProperties = {
    background: 'rgba(196,154,108,0.05)',
    border: '1px solid var(--card-border)',
    borderRadius: '0.75rem',
    padding: '0.75rem',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && <div className="px-4 py-3 rounded-xl text-sm font-medium" style={feedback.success}>✓ Salvo com sucesso!</div>}
      {error && <div className="px-4 py-3 rounded-xl text-sm" style={feedback.error}>{error}</div>}

      {/* Número */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle size={18} className="text-green-400" />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Contato</h3>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Número do WhatsApp
            <span className="font-normal ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>Com código do país (ex: 5546999720099)</span>
          </label>
          <input
            value={form.whatsapp_number}
            onChange={e => f('whatsapp_number', e.target.value.replace(/\D/g, ''))}
            className="input"
            placeholder="5546999720099"
            maxLength={15}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            Mensagem padrão (quando cliente clica em "Chamar" sem carrinho)
          </label>
          <textarea
            value={form.default_message}
            onChange={e => f('default_message', e.target.value)}
            className="input resize-none h-16"
            placeholder="Olá! Gostaria de mais informações."
            maxLength={500}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{form.default_message.length}/500</p>
        </div>
      </div>

      {/* Template produto único */}
      <div className="card space-y-3">
        <div>
          <h3 className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Template — Produto Único</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Usado quando o carrinho tem apenas 1 produto. Clique nas tags para inserir no cursor.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAGS_SINGLE.map(t => (
            <TagChip key={t.tag} tag={t.tag} desc={t.desc} onInsert={tag => insertTag(singleRef, 'whatsapp_template_single', tag)} />
          ))}
        </div>
        <textarea
          ref={singleRef}
          value={form.whatsapp_template_single}
          onChange={e => f('whatsapp_template_single', e.target.value)}
          className="input resize-y font-mono text-xs"
          rows={8}
          maxLength={2000}
        />
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <button type="button" onClick={() => f('whatsapp_template_single', DEFAULT_SINGLE)} className="text-brand-rose hover:underline">
            Restaurar padrão
          </button>
          <span>{form.whatsapp_template_single.length}/2000</span>
        </div>
        <div style={previewStyle}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Prévia (com dados de exemplo):</p>
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {form.whatsapp_template_single
              .replace('{produto}', 'Batom Rosa Intenso')
              .replace('{quantidade}', '2')
              .replace('{preco_unitario}', 'R$ 24,90')
              .replace('{subtotal}', 'R$ 49,80')
              .replace('{total}', 'R$ 49,80')
              .replace('{nome}', 'Maria')
            }
          </pre>
        </div>
      </div>

      {/* Template múltiplos */}
      <div className="card space-y-3">
        <div>
          <h3 className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Template — Múltiplos Produtos</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Usado quando o carrinho tem 2 ou mais produtos. A tag{' '}
            <code className="px-1 rounded font-mono text-brand-rose" style={{ background: 'rgba(196,154,108,0.1)' }}>{'{lista}'}</code>
            {' '}expande cada item automaticamente.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAGS_MULTIPLE.map(t => (
            <TagChip key={t.tag} tag={t.tag} desc={t.desc} onInsert={tag => insertTag(multiRef, 'whatsapp_template_multiple', tag)} />
          ))}
        </div>
        <textarea
          ref={multiRef}
          value={form.whatsapp_template_multiple}
          onChange={e => f('whatsapp_template_multiple', e.target.value)}
          className="input resize-y font-mono text-xs"
          rows={7}
          maxLength={2000}
        />
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <button type="button" onClick={() => f('whatsapp_template_multiple', DEFAULT_MULTIPLE)} className="text-brand-rose hover:underline">
            Restaurar padrão
          </button>
          <span>{form.whatsapp_template_multiple.length}/2000</span>
        </div>
        <div style={previewStyle}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Prévia (com dados de exemplo):</p>
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {form.whatsapp_template_multiple
              .replace('{lista}', '✨ *Batom Rosa Intenso*\n📦 2 und. × R$ 24,90 = R$ 49,80\n\n✨ *Hidratante Corporal*\n📦 1 und. × R$ 35,00 = R$ 35,00')
              .replace('{total}', 'R$ 84,80')
              .replace('{nome}', 'Maria')
            }
          </pre>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving
          ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <><Save size={18} /> Salvar WhatsApp</>
        }
      </button>
    </form>
  );
}
