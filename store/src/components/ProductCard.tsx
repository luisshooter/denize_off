import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageCircle, ImageOff, Tag, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreConfig, installmentLabel, type PaymentMethod } from '../context/StoreConfigContext';
import api from '../services/api';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  brand?: string | null;
  price_normal: number;
  price_promotion: number | null;
  image_url: string | null;
  stock: number;
  payment_method_ids: string[] | null;
}

interface ProductCardProps {
  product: Product;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function PaymentBadge({ method, price }: { method: PaymentMethod; price: number }) {
  const label = installmentLabel(method, price);

  const Icon = () => {
    switch (method.type) {
      case 'pix': return <Smartphone size={10} />;
      case 'credit_card': return <CreditCard size={10} />;
      case 'debit_card': return <CreditCard size={10} />;
      case 'cash': return <Banknote size={10} />;
      default: return <Wallet size={10} />;
    }
  };

  const colors: Record<PaymentMethod['type'], string> = {
    pix: 'bg-green-50 text-green-600 border-green-100',
    credit_card: 'bg-blue-50 text-blue-600 border-blue-100',
    debit_card: 'bg-indigo-50 text-indigo-500 border-indigo-100',
    cash: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    other: 'bg-gray-50 text-gray-500 border-gray-100',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${colors[method.type]}`}>
      <Icon />
      {label ? label : method.label}
    </span>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const storeConfig = useStoreConfig();
  const price = product.price_promotion ?? product.price_normal;
  const discount = product.price_promotion
    ? Math.round((1 - product.price_promotion / product.price_normal) * 100)
    : 0;

  const visibleMethods = storeConfig.payment_methods.filter(m =>
    !product.payment_method_ids?.length || product.payment_method_ids.includes(m.id)
  );

  const handleCallNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const msg = `Olá! 👋 Gostaria de informações sobre:\n*${product.name}* — ${fmt(price)}`;
      const { data } = await api.get(`/config/whatsapp-link?message=${encodeURIComponent(msg)}`);
      window.open(data.link, '_blank', 'noopener,noreferrer');
    } catch {
      alert('WhatsApp não configurado. Entre em contato por outro canal.');
    }
  };

  const handleAddCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price, image_url: product.image_url });
  };

  return (
    <div className="product-card group" onClick={() => navigate(`/produto/${product.id}`)}>

      {/* Image */}
      <div className="relative aspect-[4/5] bg-brand-rose-light overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-cream to-brand-rose-light">
            <ImageOff size={32} className="text-brand-rose/25" />
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-brand-rose text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Tag size={9} />
            -{discount}%
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-brand-dark/70 px-4 py-1.5 rounded-full tracking-wide">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1.5">
        {product.brand && (
          <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest leading-none">
            {product.brand}
          </p>
        )}

        <span className="text-[10px] font-medium text-brand-rose capitalize bg-brand-rose-light px-2 py-0.5 rounded-full self-start">
          {product.category}
        </span>

        <h3 className="font-medium text-brand-dark text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-lg font-bold text-brand-rose leading-none">{fmt(price)}</span>
          {product.price_promotion && (
            <span className="text-xs text-brand-muted line-through">{fmt(product.price_normal)}</span>
          )}
        </div>

        {visibleMethods.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleMethods.slice(0, 2).map(m => (
              <PaymentBadge key={m.id} method={m} price={price} />
            ))}
            {visibleMethods.length > 2 && (
              <span className="text-[10px] text-brand-muted self-center">+{visibleMethods.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex gap-1.5 pt-1">
          <button
            onClick={handleCallNow}
            className="flex-1 bg-[#25D366] hover:bg-[#20b956] text-white text-xs font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] select-none"
          >
            <MessageCircle size={13} />
            Chamar
          </button>
          <button
            onClick={handleAddCart}
            disabled={product.stock === 0}
            className="flex-1 bg-brand-rose hover:bg-brand-rose-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] select-none"
          >
            <ShoppingBag size={13} />
            Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
