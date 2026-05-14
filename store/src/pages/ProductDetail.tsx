import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, MessageCircle, ArrowLeft, ImageOff,
  CreditCard, Banknote, Smartphone, Wallet, CheckCircle, User, X, Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreConfig, installmentLabel, type PaymentMethod } from '../context/StoreConfigContext';
import api from '../services/api';
import { Product } from '../components/ProductCard';

const fmt = (v: number | string) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function applyTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
    template
  );
}

function PaymentRow({ method, price }: { method: PaymentMethod; price: number }) {
  const label = installmentLabel(method, price);
  const icons: Record<PaymentMethod['type'], React.ReactNode> = {
    pix:         <Smartphone size={15} className="text-green-500 flex-shrink-0" />,
    credit_card: <CreditCard size={15} className="text-blue-500 flex-shrink-0" />,
    debit_card:  <CreditCard size={15} className="text-indigo-400 flex-shrink-0" />,
    cash:        <Banknote   size={15} className="text-emerald-500 flex-shrink-0" />,
    other:       <Wallet     size={15} className="text-brand-muted flex-shrink-0" />,
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-brand-sand/50 last:border-0">
      {icons[method.type]}
      <span className="text-sm text-brand-dark font-medium flex-1">{method.label}</span>
      {label && (
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
          até {label}
        </span>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const storeConfig = useStoreConfig();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/produtos', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddCart = () => {
    if (!product) return;
    const price = product.price_promotion ?? product.price_normal;
    addItem({ id: product.id, name: product.name, price, image_url: product.image_url });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const openNameModal = () => {
    setNameError('');
    setShowNameModal(true);
  };

  const confirmCallNow = async () => {
    if (!customerName.trim()) {
      setNameError('Informe seu nome para continuar');
      return;
    }
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
    } catch {
      alert('WhatsApp não configurado.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return null;

  const price = product.price_promotion ?? product.price_normal;
  const discount = product.price_promotion
    ? Math.round((1 - product.price_promotion / product.price_normal) * 100)
    : 0;

  const visibleMethods = storeConfig.payment_methods.filter(m =>
    !product.payment_method_ids?.length || product.payment_method_ids.includes(m.id)
  );

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-8 animate-fade-in">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-dark transition-colors text-sm font-medium mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Voltar
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">

          {/* Image */}
          <div className="relative aspect-[4/5] bg-gradient-to-br from-brand-cream to-brand-rose-light rounded-3xl overflow-hidden shadow-card">
            {product.image_url ? (
              <>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff size={56} className="text-brand-rose/20" />
              </div>
            )}

            {discount > 0 && (
              <div className="absolute top-4 left-4 flex items-center gap-1 bg-brand-rose text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-rose">
                <Tag size={11} /> -{discount}%
              </div>
            )}

            {product.image_url && (
              <div className="absolute bottom-4 left-4">
                <span className="text-xs font-semibold text-white/90 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full capitalize">
                  {product.category}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">

            {product.brand && (
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">
                {product.brand}
              </p>
            )}

            <h1 className="font-display text-3xl font-bold text-brand-dark leading-tight mb-4">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-brand-muted leading-relaxed mb-5 text-sm sm:text-base">
                {product.description}
              </p>
            )}

            {/* Price card */}
            <div className="bg-gradient-to-r from-brand-rose-light to-brand-cream rounded-2xl px-5 py-4 mb-3 border border-brand-sand/60">
              <div className="flex items-end gap-3">
                <span className="font-display text-4xl font-bold text-brand-rose leading-none">
                  {fmt(price)}
                </span>
                {product.price_promotion && (
                  <span className="text-lg text-brand-muted line-through mb-0.5">
                    {fmt(product.price_normal)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-xs text-brand-rose font-semibold mt-1.5">
                  Você economiza {fmt(product.price_normal - price)} nesta oferta
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6 px-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                product.stock === 0 ? 'bg-red-400' : product.stock <= 5 ? 'bg-amber-400' : 'bg-green-500'
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
              <div className="mb-7 bg-brand-cream rounded-2xl p-4 border border-brand-sand/50">
                <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-2">
                  Formas de Pagamento
                </p>
                {visibleMethods.map(m => <PaymentRow key={m.id} method={m} price={price} />)}
              </div>
            )}

            {/* CTAs — desktop only */}
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

      {/* Sticky CTA — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-sm border-t border-brand-sand/60 px-4 py-3 flex gap-2 shadow-[0_-4px_24px_rgba(30,27,46,0.1)]">
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

      {/* Name modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNameModal(false)}
          />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl px-6 pt-7 pb-10 sm:pb-6 w-full sm:max-w-sm shadow-2xl animate-slide-up">

            {/* Handle bar (mobile) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-brand-sand rounded-full sm:hidden" />

            <button
              onClick={() => setShowNameModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-brand-muted hover:text-brand-dark hover:bg-brand-cream transition-colors hidden sm:flex"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-[#25D366]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={22} className="text-[#25D366]" />
              </div>
              <div>
                <p className="font-semibold text-brand-dark text-base leading-tight">Quase lá! 😊</p>
                <p className="text-xs text-brand-muted mt-0.5">Como posso te chamar?</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-2">
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
              {nameError && (
                <p className="text-xs text-red-500 mt-1.5">⚠ {nameError}</p>
              )}
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
