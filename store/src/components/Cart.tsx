import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, MessageCircle, ArrowRight, ArrowLeft, User, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import api from '../services/api';

interface CartProps {
  open: boolean;
  onClose: () => void;
}

const fmt = (v: number | string) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function applyTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
    template
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ {msg}</p>;
}

export default function Cart({ open, onClose }: CartProps) {
  const { items, count, total, removeItem, updateQty, clear } = useCart();
  const config = useStoreConfig();
  const [step, setStep]           = useState<'cart' | 'checkout'>('cart');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [sending, setSending]     = useState(false);
  const [apiError, setApiError]   = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearField = (k: string) =>
    setFieldErrors(prev => ({ ...prev, [k]: '' }));

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep('cart'); setApiError(''); setFieldErrors({}); }, 300);
  };

  const goBack = () => { setStep('cart'); setApiError(''); setFieldErrors({}); };

  const buildMessage = (fullName: string): string => {
    if (items.length === 1) {
      const item = items[0];
      return applyTemplate(config.whatsapp_template_single, {
        produto:        item.name,
        quantidade:     String(item.quantity),
        preco_unitario: fmt(item.price),
        subtotal:       fmt(item.price * item.quantity),
        total:          fmt(total),
        nome:           fullName,
      });
    }
    const lista = items
      .map(i => `✨ *${i.name}*\n📦 ${i.quantity} und. × ${fmt(i.price)} = ${fmt(i.price * i.quantity)}`)
      .join('\n\n');
    return applyTemplate(config.whatsapp_template_multiple, { lista, total: fmt(total), nome: fullName });
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!firstName.trim())
      errs.firstName = 'Informe seu nome';
    if (!lastName.trim())
      errs.lastName = 'Informe seu sobrenome';
    const digits = phone.replace(/\D/g, '');
    if (!digits)
      errs.phone = 'Informe seu número de WhatsApp';
    else if (digits.length < 10)
      errs.phone = 'Número inválido — inclua o DDD (ex: 46 9 9999-9999)';
    return errs;
  };

  const handleOrder = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setApiError('');
    setSending(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    try {
      await api.post('/orders', {
        customer_name:  fullName,
        customer_phone: phone.replace(/\D/g, ''),
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      });
      const msg = buildMessage(fullName);
      const { data } = await api.get(`/config/whatsapp-link?message=${encodeURIComponent(msg)}`);
      clear();
      handleClose();
      window.open(data.link, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Erro ao enviar pedido. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-40" onClick={handleClose} />
      )}

      <div className={`
        fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl
        flex flex-col transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-sand/50">
          {step === 'checkout' ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-brand-muted hover:text-brand-dark transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-rose" />
              <h2 className="font-semibold text-brand-dark text-base">
                Carrinho{' '}
                <span className="text-brand-muted font-normal text-sm">({count})</span>
              </h2>
            </div>
          )}
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-brand-cream transition-colors text-brand-muted hover:text-brand-dark"
          >
            <X size={18} />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={26} className="text-brand-rose/30" />
            </div>
            <p className="font-semibold text-brand-dark">Carrinho vazio</p>
            <p className="text-sm mt-1 text-brand-muted">Adicione produtos para continuar</p>
            <button onClick={handleClose} className="mt-6 btn-outline text-sm px-5 py-2.5 min-h-0 h-10">
              Ver produtos
            </button>
          </div>

        ) : step === 'cart' ? (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-brand-cream rounded-2xl">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand-rose-light flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={18} className="text-brand-rose/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-brand-dark line-clamp-1">{item.name}</p>
                    <p className="text-brand-rose font-semibold text-sm mt-0.5">{fmt(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5 bg-white rounded-full border border-brand-sand px-1 py-0.5">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-brand-rose-light hover:text-brand-rose transition-colors text-brand-muted"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center text-brand-dark select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-brand-rose-light hover:text-brand-rose transition-colors text-brand-muted"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1.5 rounded-full text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-brand-sand/50 space-y-3 bg-white">
              <div className="flex justify-between items-center">
                <span className="text-brand-muted text-sm">Total do pedido</span>
                <span className="font-display text-2xl font-bold text-brand-rose">{fmt(total)}</span>
              </div>
              <button onClick={() => setStep('checkout')} className="btn-whatsapp w-full">
                <MessageCircle size={18} />
                Finalizar pelo WhatsApp
                <ArrowRight size={15} className="ml-auto" />
              </button>
              <button onClick={clear} className="w-full text-xs text-brand-muted hover:text-red-500 transition-colors py-1 select-none">
                Limpar carrinho
              </button>
            </div>
          </>

        ) : (
          <>
            {/* Checkout form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Order summary */}
              <div className="bg-brand-cream rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-3">Resumo do pedido</p>
                {items.map(i => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-brand-dark truncate mr-2">{i.name} ×{i.quantity}</span>
                    <span className="text-brand-muted flex-shrink-0">{fmt(i.price * i.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-brand-sand pt-2 mt-1 flex justify-between font-semibold">
                  <span className="text-brand-dark">Total</span>
                  <span className="text-brand-rose">{fmt(total)}</span>
                </div>
              </div>

              {apiError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl animate-fade-in">
                  {apiError}
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-4">

                {/* Linha: Nome + Sobrenome */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-brand-dark uppercase tracking-widest mb-2 block">
                      Nome <span className="text-brand-rose">*</span>
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => { setFirstName(e.target.value); clearField('firstName'); }}
                        placeholder="Maria"
                        className={`input-field pl-9 ${fieldErrors.firstName ? 'border-red-400 focus:ring-red-200' : ''}`}
                      />
                    </div>
                    <FieldError msg={fieldErrors.firstName} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-brand-dark uppercase tracking-widest mb-2 block">
                      Sobrenome <span className="text-brand-rose">*</span>
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => { setLastName(e.target.value); clearField('lastName'); }}
                        placeholder="Silva"
                        className={`input-field pl-9 ${fieldErrors.lastName ? 'border-red-400 focus:ring-red-200' : ''}`}
                      />
                    </div>
                    <FieldError msg={fieldErrors.lastName} />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="text-[10px] font-semibold text-brand-dark uppercase tracking-widest mb-2 block">
                    WhatsApp com DDD <span className="text-brand-rose">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); clearField('phone'); }}
                      placeholder="(46) 9 9999-9999"
                      className={`input-field pl-10 ${fieldErrors.phone ? 'border-red-400 focus:ring-red-200' : ''}`}
                    />
                  </div>
                  <FieldError msg={fieldErrors.phone} />
                  {!fieldErrors.phone && (
                    <p className="text-[11px] text-brand-muted mt-1.5">
                      Usamos para entrar em contato sobre seu pedido
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Send button */}
            <div className="p-5 border-t border-brand-sand/50 bg-white">
              <button onClick={handleOrder} disabled={sending} className="btn-whatsapp w-full">
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageCircle size={18} />
                    Enviar Pedido
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
