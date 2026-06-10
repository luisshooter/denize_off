import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, MessageCircle, ArrowLeft, ImageOff,
  CreditCard, Banknote, Smartphone, Wallet, CheckCircle, User, X, Tag, ChevronDown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreConfig, installmentLabel, type PaymentMethod } from '../context/StoreConfigContext';
import { useThemeOverride } from '../context/ThemeContext';
import api from '../services/api';
import { Product } from '../components/ProductCard';

const fmt = (v: number | string) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function applyTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
    template
  );
}

// ── Payment Row ─────────────────────────────────────────────────────────
function PaymentRow({ method, price, dark }: { method: PaymentMethod; price: number; dark?: boolean }) {
  const label = installmentLabel(method, price);
  const icons: Record<PaymentMethod['type'], React.ReactNode> = {
    pix:         <Smartphone size={15} className={dark ? 'text-green-400 flex-shrink-0' : 'text-green-500 flex-shrink-0'} />,
    credit_card: <CreditCard size={15} className={dark ? 'text-blue-400 flex-shrink-0' : 'text-blue-500 flex-shrink-0'} />,
    debit_card:  <CreditCard size={15} className={dark ? 'text-indigo-400 flex-shrink-0' : 'text-indigo-400 flex-shrink-0'} />,
    cash:        <Banknote   size={15} className={dark ? 'text-emerald-400 flex-shrink-0' : 'text-emerald-500 flex-shrink-0'} />,
    other:       <Wallet     size={15} className={dark ? 'text-masc-copper/70 flex-shrink-0' : 'text-brand-muted flex-shrink-0'} />,
  };

  if (dark) {
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-masc-copper/10 last:border-0">
        {icons[method.type]}
        <span className="text-sm text-masc-warm font-medium flex-1">{method.label}</span>
        {label && (
          <span className="text-xs font-semibold text-masc-copper bg-masc-copper/10 border border-masc-copper/20 px-2.5 py-0.5 rounded-full">
            até {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-brand-sand/50 last:border-0">
      {icons[method.type]}
      <span className="text-sm text-[#1A0A10] font-medium flex-1">{method.label}</span>
      {label && (
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
          até {label}
        </span>
      )}
    </div>
  );
}

// ── Smoke Particles (masc) ───────────────────────────────────────────────
function SmokeParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="smoke-particle"
          style={{
            width: `${40 + i * 18}px`,
            height: `${40 + i * 18}px`,
            left: `${12 + i * 22}%`,
            bottom: `${6 + (i % 2) * 10}%`,
            animationDelay: `${i * 1.4}s`,
            animationDuration: `${5 + i * 1.3}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Ember Particles (masc) ───────────────────────────────────────────────
function EmberParticles() {
  const embers = [
    { size: 3, left: '18%', bottom: '14%', dx: '8px',  delay: '0s',   dur: '3.2s' },
    { size: 2, left: '34%', bottom: '9%',  dx: '-6px', delay: '1.1s', dur: '4s'   },
    { size: 4, left: '54%', bottom: '19%', dx: '12px', delay: '0.5s', dur: '3.5s' },
    { size: 2, left: '68%', bottom: '7%',  dx: '-8px', delay: '1.6s', dur: '4.5s' },
    { size: 3, left: '81%', bottom: '17%', dx: '6px',  delay: '2.1s', dur: '3s'   },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {embers.map((e, i) => (
        <div
          key={i}
          className="masc-promo-ember"
          style={{
            width: `${e.size}px`,
            height: `${e.size}px`,
            left: e.left,
            bottom: e.bottom,
            background: 'radial-gradient(circle, rgba(196,154,108,0.95) 0%, rgba(255,200,100,0.5) 60%, transparent 100%)',
            '--ex': e.dx,
            animationDelay: e.delay,
            animationDuration: e.dur,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Petal Particles (fem) ────────────────────────────────────────────────
function PetalParticles() {
  const petals = [
    { size: 8,  left: '14%', bottom: '12%', pdx: '10px',  prot: '35deg',  delay: '0s',   dur: '7s'  },
    { size: 6,  left: '29%', bottom: '6%',  pdx: '-8px',  prot: '-22deg', delay: '1.5s', dur: '9s'  },
    { size: 10, left: '58%', bottom: '17%', pdx: '14px',  prot: '52deg',  delay: '0.8s', dur: '8s'  },
    { size: 7,  left: '76%', bottom: '8%',  pdx: '-10px', prot: '-38deg', delay: '2.2s', dur: '10s' },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {petals.map((p, i) => (
        <div
          key={i}
          className="fem-petal"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            bottom: p.bottom,
            background: 'rgba(196,154,108,0.38)',
            '--pdx': p.pdx,
            '--prot': p.prot,
            animationDelay: p.delay,
            animationDuration: p.dur,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const storeConfig = useStoreConfig();
  const setThemeOverride                  = useThemeOverride();
  const [product, setProduct]             = useState<Product | null>(null);
  const [loading, setLoading]             = useState(true);
  const [added, setAdded]                 = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [customerName, setCustomerName]   = useState('');
  const [nameError, setNameError]         = useState('');
  const [descExpanded, setDescExpanded]   = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/produtos', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Sync header theme + body bg based on product gender
  useEffect(() => {
    if (!product) return;
    const isMascProduct = product.gender === 'masculino';
    setThemeOverride(isMascProduct ? 'masculino' : 'feminino');
    document.body.style.background = isMascProduct ? '#0F0E0D' : '';
    return () => {
      setThemeOverride(null);
      document.body.style.background = '';
    };
  }, [product, setThemeOverride]);

  const handleAddCart = () => {
    if (!product) return;
    const price = product.price_promotion ?? product.price_normal;
    addItem({ id: product.id, name: product.name, price, image_url: product.image_url });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const openNameModal = () => { setNameError(''); setShowNameModal(true); };

  const confirmCallNow = async () => {
    if (!customerName.trim()) { setNameError('Informe seu nome para continuar'); return; }
    setShowNameModal(false);
    if (!product) return;
    try {
      const price = product.price_promotion ?? product.price_normal;
      const msg = applyTemplate(storeConfig.whatsapp_template_single, {
        produto: product.name,
        quantidade: '1',
        preco_unitario: fmt(price),
        subtotal: fmt(price),
        total: fmt(price),
        nome: customerName.trim(),
      });
      const { data } = await api.get(`/config/whatsapp-link?message=${encodeURIComponent(msg)}`);
      window.open(data.link, '_blank', 'noopener,noreferrer');
    } catch { alert('WhatsApp não configurado.'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-copper border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return null;

  const isMasc      = product.gender === 'masculino';
  const price       = product.price_promotion ?? product.price_normal;
  const discount    = product.price_promotion
    ? Math.round((1 - product.price_promotion / product.price_normal) * 100)
    : 0;
  const isLongDesc  = (product.description?.length ?? 0) > 280;

  const visibleMethods = storeConfig.payment_methods.filter(m =>
    !product.payment_method_ids?.length || product.payment_method_ids.includes(m.id)
  );

  // ══════════════════════════════════════════════════════════
  // MASCULINE
  // ══════════════════════════════════════════════════════════
  if (isMasc) {
    return (
      <>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-8 animate-fade-in">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-masc-muted hover:text-masc-warm transition-colors text-sm font-medium mb-8 group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar
          </button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-14">

            {/* ── Image ── */}
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-masc-card">

              {/* Base */}
              <div className="absolute inset-0 bg-gradient-to-br from-masc-surface via-masc-dark to-masc-darker" />

              {product.image_url ? (
                <>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="relative z-10 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-masc-darker/65 via-transparent to-masc-darker/15" />
                  <div className="absolute inset-0 z-20 bg-gradient-to-r from-masc-darker/25 via-transparent to-transparent" />
                </>
              ) : (
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <ImageOff size={56} className="text-masc-copper/20" />
                </div>
              )}

              {/* Particles */}
              <div className="absolute inset-0 z-30">
                <SmokeParticles />
                <EmberParticles />
              </div>

              {/* Gold ring */}
              <div className="absolute inset-0 z-40 rounded-3xl ring-1 ring-masc-copper/22 pointer-events-none" />

              {/* Top-right copper glow */}
              <div className="absolute top-0 right-0 z-30 w-32 h-32 pointer-events-none overflow-hidden rounded-tr-3xl">
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-masc-copper/8 blur-2xl" />
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 z-50 flex items-center gap-1 bg-masc-copper text-masc-darker text-xs font-bold px-3 py-1.5 rounded-full shadow-gold">
                  <Tag size={11} /> -{discount}%
                </div>
              )}

              {/* Category */}
              {product.image_url && (
                <div className="absolute bottom-4 left-4 z-50">
                  <span className="text-xs font-semibold text-masc-warm/90 bg-masc-darker/55 backdrop-blur-sm border border-masc-copper/25 px-3 py-1 rounded-full capitalize tracking-wide">
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="flex flex-col">

              {/* Brand line */}
              {product.brand && (
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-masc-copper/55" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-masc-copper/80">
                    {product.brand}
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-masc-copper/55 to-transparent" />
                </div>
              )}

              {/* Name */}
              <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-3 masc-gold-text">
                {product.name}
              </h1>

              {/* Copper rule */}
              <div className="w-14 h-px bg-gradient-to-r from-masc-copper/70 to-transparent mb-6 rounded-full" />

              {/* Description */}
              {product.description && (
                <div className="mb-7">
                  <p className={`text-masc-warm/60 leading-relaxed text-sm transition-all duration-300 ${!descExpanded && isLongDesc ? 'line-clamp-4' : ''}`}>
                    {product.description}
                  </p>
                  {isLongDesc && (
                    <button
                      onClick={() => setDescExpanded(v => !v)}
                      className="flex items-center gap-1 text-xs text-masc-copper/75 hover:text-masc-copper mt-2.5 transition-colors cursor-pointer font-medium"
                    >
                      {descExpanded ? 'Ver menos' : 'Ver mais'}
                      <ChevronDown size={12} className={`transition-transform duration-200 ${descExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Price card */}
              <div className="relative rounded-2xl p-5 mb-4 border border-masc-copper/18 overflow-hidden"
                   style={{ background: 'linear-gradient(135deg, #1A1714 0%, #221E1B 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-masc-copper/4 via-transparent to-masc-copper/2 pointer-events-none" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-masc-copper/6 rounded-full -translate-y-8 translate-x-8 blur-lg pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[10px] font-semibold text-masc-copper/60 uppercase tracking-widest mb-2">Valor</p>
                  <div className="flex items-end gap-3">
                    <span className="font-display text-4xl font-bold leading-none masc-gold-text">
                      {fmt(price)}
                    </span>
                    {product.price_promotion && (
                      <span className="text-lg text-masc-stone-light line-through mb-0.5">
                        {fmt(product.price_normal)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className="text-xs text-masc-copper/75 font-semibold mt-2">
                      Economia de {fmt(product.price_normal - price)} nesta oferta
                    </p>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6 px-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  product.stock === 0 ? 'bg-red-500' : product.stock <= 5 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
                }`} />
                <span className={`text-sm font-medium ${
                  product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {product.stock === 0
                    ? 'Produto esgotado'
                    : product.stock <= 5
                      ? `Últimas ${product.stock} unidade${product.stock === 1 ? '' : 's'} — garanta já`
                      : `${product.stock} unidades disponíveis`
                  }
                </span>
              </div>

              {/* Payment methods */}
              {visibleMethods.length > 0 && (
                <div className="mb-7 rounded-2xl p-4 border border-masc-copper/14"
                     style={{ background: 'rgba(26,23,20,0.85)' }}>
                  <p className="text-[10px] font-semibold text-masc-copper/65 uppercase tracking-widest mb-2">
                    Formas de Pagamento
                  </p>
                  {visibleMethods.map(m => <PaymentRow key={m.id} method={m} price={price} dark />)}
                </div>
              )}

              {/* CTAs — desktop */}
              <div className="space-y-3 mt-auto hidden sm:block">
                <button
                  onClick={handleAddCart}
                  disabled={product.stock === 0}
                  className={`btn-masc-gold w-full text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                    added ? '!bg-emerald-600 hover:!bg-emerald-600 !text-white shadow-none' : ''
                  }`}
                >
                  {added
                    ? <><CheckCircle size={20} /> Adicionado ao carrinho!</>
                    : <><ShoppingBag size={20} /> Adicionar ao Carrinho</>
                  }
                </button>
                <button
                  onClick={openNameModal}
                  className="w-full bg-[#25D366] hover:bg-[#20b956] text-white font-semibold
                             px-6 py-3 rounded-full transition-all duration-200
                             shadow-md hover:shadow-lg active:scale-[0.98]
                             flex items-center justify-center gap-2 min-h-[48px]
                             select-none cursor-pointer"
                >
                  <MessageCircle size={20} />
                  Chamar pelo WhatsApp
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Sticky CTA — mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden px-4 py-3 flex gap-2
                        backdrop-blur-sm border-t border-masc-copper/18"
             style={{ background: 'rgba(10,9,8,0.95)' }}>
          {product && (
            <>
              <button
                onClick={handleAddCart}
                disabled={product.stock === 0}
                className={`btn-masc-gold flex-1 text-sm !py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                  added ? '!bg-emerald-600 !text-white' : ''
                }`}
              >
                {added
                  ? <><CheckCircle size={17} /> Adicionado!</>
                  : <><ShoppingBag size={17} /> Adicionar</>
                }
              </button>
              <button
                onClick={openNameModal}
                className="flex-1 text-sm py-2.5 rounded-full bg-[#25D366] hover:bg-[#20b956] text-white
                           font-semibold flex items-center justify-center gap-2 transition-all
                           cursor-pointer min-h-[44px] active:scale-[0.98]"
              >
                <MessageCircle size={17} />
                WhatsApp
              </button>
            </>
          )}
        </div>

        {/* Name modal — dark */}
        {showNameModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNameModal(false)} />
            <div className="relative rounded-t-3xl sm:rounded-3xl px-6 pt-7 pb-10 sm:pb-6
                            w-full sm:max-w-sm shadow-2xl animate-slide-up
                            border border-masc-copper/18"
                 style={{ background: '#1A1714' }}>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-masc-stone rounded-full sm:hidden" />
              <button
                onClick={() => setShowNameModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-masc-muted hover:text-masc-warm
                           hover:bg-masc-surface transition-colors hidden sm:flex cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-[#25D366]/12 rounded-2xl flex items-center justify-center
                                flex-shrink-0 border border-[#25D366]/20">
                  <MessageCircle size={22} className="text-[#25D366]" />
                </div>
                <div>
                  <p className="font-semibold text-masc-warm text-base leading-tight">Quase lá!</p>
                  <p className="text-xs text-masc-muted mt-0.5">Como posso te chamar?</p>
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-[10px] font-bold text-masc-copper/80 uppercase tracking-widest mb-2">
                  Seu nome
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-masc-muted pointer-events-none" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => { setCustomerName(e.target.value); setNameError(''); }}
                    onKeyDown={e => e.key === 'Enter' && confirmCallNow()}
                    placeholder="Ex: Carlos"
                    className="w-full rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none transition-all
                               border text-masc-warm placeholder:text-masc-muted
                               bg-masc-surface border-masc-copper/20
                               focus:border-masc-copper/50 focus:ring-2 focus:ring-masc-copper/10"
                    autoFocus
                  />
                </div>
                {nameError && <p className="text-xs text-red-400 mt-1.5">{nameError}</p>}
              </div>
              <button onClick={confirmCallNow} className="btn-whatsapp w-full">
                <MessageCircle size={18} />
                Chamar pelo WhatsApp
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // ══════════════════════════════════════════════════════════
  // FEMININE / MISTO
  // ══════════════════════════════════════════════════════════
  return (
    <>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-8 animate-fade-in">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-primary transition-colors text-sm font-medium mb-8 group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Voltar
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">

          {/* ── Image ── */}
          <div className="relative aspect-[4/5] bg-gradient-to-br from-brand-cream to-brand-blush rounded-3xl overflow-hidden shadow-card">
            {product.image_url ? (
              <>
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/20 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff size={56} className="text-brand-copper/20" />
              </div>
            )}

            {/* Petals */}
            <div className="absolute inset-0 z-10">
              <PetalParticles />
            </div>

            {/* Soft copper ring */}
            <div className="absolute inset-0 z-20 rounded-3xl ring-1 ring-brand-copper/18 pointer-events-none" />

            {/* Top-right warm accent */}
            <div className="absolute top-0 right-0 z-10 w-28 h-28 pointer-events-none overflow-hidden rounded-tr-3xl">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-brand-copper/8 blur-2xl" />
            </div>

            {discount > 0 && (
              <div className="absolute top-4 left-4 z-30 flex items-center gap-1 bg-brand-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-burgundy">
                <Tag size={11} /> -{discount}%
              </div>
            )}

            {product.image_url && (
              <div className="absolute bottom-4 left-4 z-30">
                <span className="text-xs font-semibold text-white/90 bg-brand-primary/40 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full capitalize">
                  {product.category}
                </span>
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col">

            {/* Brand line */}
            {product.brand && (
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-px w-6 bg-gradient-to-r from-transparent to-brand-copper/55" />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-copper/80">
                  {product.brand}
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-brand-copper/55 to-transparent" />
              </div>
            )}

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-primary leading-tight mb-3">
              {product.name}
            </h1>

            {/* Copper rule */}
            <div className="w-14 h-px bg-gradient-to-r from-brand-copper/70 to-transparent mb-6 rounded-full" />

            {/* Description */}
            {product.description && (
              <div className="mb-7">
                <p className={`text-brand-muted leading-relaxed text-sm transition-all duration-300 ${!descExpanded && isLongDesc ? 'line-clamp-4' : ''}`}>
                  {product.description}
                </p>
                {isLongDesc && (
                  <button
                    onClick={() => setDescExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs text-brand-copper/75 hover:text-brand-copper mt-2.5 transition-colors cursor-pointer font-medium"
                  >
                    {descExpanded ? 'Ver menos' : 'Ver mais'}
                    <ChevronDown size={12} className={`transition-transform duration-200 ${descExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            )}

            {/* Price card */}
            <div className="relative bg-gradient-to-br from-brand-blush via-brand-cream to-brand-sand rounded-2xl px-5 py-4 mb-4 border border-brand-copper/22 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-copper/6 rounded-full -translate-y-8 translate-x-8 blur-lg pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-2">Valor</p>
                <div className="flex items-end gap-3">
                  <span className="font-display text-4xl font-bold text-brand-primary leading-none">
                    {fmt(price)}
                  </span>
                  {product.price_promotion && (
                    <span className="text-lg text-brand-muted line-through mb-0.5">
                      {fmt(product.price_normal)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-xs text-brand-copper font-semibold mt-1.5">
                    Você economiza {fmt(product.price_normal - price)} nesta oferta
                  </p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6 px-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                product.stock === 0 ? 'bg-red-400' : product.stock <= 5 ? 'bg-amber-400 animate-pulse' : 'bg-green-500'
              }`} />
              <span className={`text-sm font-medium ${
                product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {product.stock === 0
                  ? 'Produto esgotado'
                  : product.stock <= 5
                    ? `Últimas ${product.stock} unidade${product.stock === 1 ? '' : 's'}!`
                    : `${product.stock} unidades disponíveis`
                }
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                  Corre!
                </span>
              )}
            </div>

            {/* Payment methods */}
            {visibleMethods.length > 0 && (
              <div className="mb-7 bg-brand-cream rounded-2xl p-4 border border-brand-sand/60">
                <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-2">
                  Formas de Pagamento
                </p>
                {visibleMethods.map(m => <PaymentRow key={m.id} method={m} price={price} />)}
              </div>
            )}

            {/* CTAs — desktop */}
            <div className="space-y-3 mt-auto hidden sm:block">
              <button
                onClick={handleAddCart}
                disabled={product.stock === 0}
                className={`btn-rose w-full text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                  added ? '!bg-green-500 hover:!bg-green-500' : ''
                }`}
              >
                {added
                  ? <><CheckCircle size={20} /> Adicionado ao carrinho!</>
                  : <><ShoppingBag size={20} /> Adicionar ao Carrinho</>
                }
              </button>
              <button onClick={openNameModal} className="btn-whatsapp w-full text-base">
                <MessageCircle size={20} />
                Chamar pelo WhatsApp
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA — mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-sm
                      border-t border-brand-sand/60 px-4 py-3 flex gap-2
                      shadow-[0_-4px_24px_rgba(30,27,46,0.1)]">
        {product && (
          <>
            <button
              onClick={handleAddCart}
              disabled={product.stock === 0}
              className={`btn-rose flex-1 text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                added ? '!bg-green-500 hover:!bg-green-500' : ''
              }`}
            >
              {added
                ? <><CheckCircle size={17} /> Adicionado!</>
                : <><ShoppingBag size={17} /> Adicionar</>
              }
            </button>
            <button onClick={openNameModal} className="btn-whatsapp flex-1 text-sm !py-2.5">
              <MessageCircle size={17} />
              WhatsApp
            </button>
          </>
        )}
      </div>

      {/* Name modal — light */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNameModal(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl px-6 pt-7 pb-10 sm:pb-6
                          w-full sm:max-w-sm shadow-2xl animate-slide-up">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-brand-sand rounded-full sm:hidden" />
            <button
              onClick={() => setShowNameModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-brand-muted hover:text-brand-primary
                         hover:bg-brand-cream transition-colors hidden sm:flex cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-[#25D366]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={22} className="text-[#25D366]" />
              </div>
              <div>
                <p className="font-semibold text-brand-primary text-base leading-tight">Quase lá! 😊</p>
                <p className="text-xs text-brand-muted mt-0.5">Como posso te chamar?</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-2">
                Seu nome
              </label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                <input
                  type="text"
                  value={customerName}
                  onChange={e => { setCustomerName(e.target.value); setNameError(''); }}
                  onKeyDown={e => e.key === 'Enter' && confirmCallNow()}
                  placeholder="Ex: Maria"
                  className="input-field pl-10"
                  autoFocus
                />
              </div>
              {nameError && <p className="text-xs text-red-500 mt-1.5">{nameError}</p>}
            </div>
            <button onClick={confirmCallNow} className="btn-whatsapp w-full">
              <MessageCircle size={18} />
              Chamar pelo WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  );
}
