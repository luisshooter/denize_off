import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageCircle, ImageOff, Tag, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreConfig, installmentLabel, type PaymentMethod } from '../context/StoreConfigContext';
import api from '../services/api';

const BRAND_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Natura:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Avon:    { bg: 'bg-pink-50',    text: 'text-pink-700',    dot: 'bg-pink-500'    },
  Farmasi: { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
};

const BRAND_STYLES_MASC: Record<string, { bg: string; text: string; dot: string }> = {
  Natura:  { bg: 'rgba(16,185,129,0.12)', text: '#10b981', dot: '#10b981' },
  Avon:    { bg: 'rgba(202,138,4,0.12)',  text: '#CA8A04', dot: '#CA8A04' },
  Farmasi: { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6', dot: '#8b5cf6' },
};

function BrandBadge({ brand, masc }: { brand: string; masc?: boolean }) {
  if (masc) {
    const s = BRAND_STYLES_MASC[brand] ?? { bg: 'rgba(120,113,108,0.15)', text: '#78716C', dot: '#78716C' };
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
        {brand}
      </span>
    );
  }
  const s = BRAND_STYLES[brand] ?? { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {brand}
    </span>
  );
}

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
  gender?: 'feminino' | 'masculino' | 'misto';
  payment_method_ids: string[] | null;
}

interface ProductCardProps {
  product: Product;
  theme?: 'feminino' | 'masculino';
}

const fmt = (v: number | string) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function PaymentBadge({ method, price, masc }: { method: PaymentMethod; price: number; masc?: boolean }) {
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

  const colors: Record<PaymentMethod['type'], string> = masc ? {
    pix: 'bg-green-900/30 text-green-400 border-green-800/40',
    credit_card: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
    debit_card: 'bg-indigo-900/30 text-indigo-400 border-indigo-800/40',
    cash: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
    other: 'bg-stone-800/40 text-stone-400 border-stone-700/40',
  } : {
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

export default function ProductCard({ product, theme = 'feminino' }: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const storeConfig = useStoreConfig();
  const price = product.price_promotion ?? product.price_normal;
  const isMasc = theme === 'masculino';
  const discount = product.price_promotion
    ? Math.round((1 - product.price_promotion / product.price_normal) * 100)
    : 0;

  const visibleMethods = storeConfig.payment_methods.filter(m =>
    !product.payment_method_ids?.length || product.payment_method_ids.includes(m.id)
  );

  const handleCallNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const msg = isMasc
        ? `Olá! Tenho interesse em:\n\n*${product.name}*\n${fmt(price)}\n\nPode me ajudar?`
        : `🌸 Olá! Tenho interesse em:\n\n✨ *${product.name}*\n💰 ${fmt(price)}\n\nPode me ajudar? 😊`;
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

  if (isMasc) {
    return (
      <div className="masc-card group" onClick={() => navigate(`/produto/${product.id}`)}>

        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden" style={{ background: 'linear-gradient(135deg, #292524, #1C1917)' }}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1C1917, #3D2B1F)' }}>
              <ImageOff size={32} style={{ color: 'rgba(202,138,4,0.2)' }} />
            </div>
          )}

          {discount > 0 && (
            <div
              className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #CA8A04, #A16207)', color: '#0C0A09' }}
            >
              <Tag size={9} />
              -{discount}%
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 backdrop-blur-[2px] flex items-center justify-center" style={{ background: 'rgba(12,10,9,0.65)' }}>
              <span className="font-semibold text-sm px-4 py-1.5 rounded-full tracking-wide" style={{ color: '#D6D3D1', background: 'rgba(28,25,23,0.8)', border: '1px solid rgba(202,138,4,0.2)' }}>
                Esgotado
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.brand && <BrandBadge brand={product.brand} masc />}
            <span
              className="text-[10px] font-medium capitalize px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(202,138,4,0.1)', color: '#CA8A04' }}
            >
              {product.category}
            </span>
          </div>

          <h3 className="font-medium text-sm leading-snug line-clamp-2" style={{ color: '#F5F0EB', fontFamily: "'Jost', system-ui, sans-serif" }}>
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold leading-none masc-gold-text" style={{ fontFamily: "'Bodoni Moda', Georgia, serif" }}>
              {fmt(price)}
            </span>
            {product.price_promotion && (
              <span className="text-xs line-through" style={{ color: '#78716C' }}>{fmt(product.price_normal)}</span>
            )}
          </div>

          {visibleMethods.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleMethods.slice(0, 2).map(m => (
                <PaymentBadge key={m.id} method={m} price={price} masc />
              ))}
              {visibleMethods.length > 2 && (
                <span className="text-[10px] self-center" style={{ color: '#78716C' }}>+{visibleMethods.length - 2}</span>
              )}
            </div>
          )}

          <div className="flex gap-1.5 pt-1">
            <button
              onClick={handleCallNow}
              className="flex-1 text-xs font-semibold py-2.5 rounded-full transition-all active:scale-[0.98] select-none flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ background: '#25D366', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#20b956')}
              onMouseLeave={e => (e.currentTarget.style.background = '#25D366')}
            >
              <MessageCircle size={13} />
              Chamar
            </button>
            <button
              onClick={handleAddCart}
              disabled={product.stock === 0}
              className="flex-1 text-xs font-semibold py-2.5 rounded-full transition-all active:scale-[0.98] select-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #CA8A04, #A16207)', color: '#0C0A09' }}
              onMouseEnter={e => { if (!product.stock) return; (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #EAB308, #CA8A04)'; }}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #CA8A04, #A16207)'}
            >
              <ShoppingBag size={13} />
              Carrinho
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Feminine card ── */
  return (
    <div className="product-card group" onClick={() => navigate(`/produto/${product.id}`)}>

      {/* Image */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-brand-cream to-brand-rose-light overflow-hidden">
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
          <div className="absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #D4509F, #8B5CF6)' }}>
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
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.brand && <BrandBadge brand={product.brand} />}
          <span className="text-[10px] font-medium text-brand-rose capitalize bg-brand-rose-light px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>

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
            className="flex-1 bg-[#25D366] hover:bg-[#20b956] text-white text-xs font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] select-none cursor-pointer"
          >
            <MessageCircle size={13} />
            Chamar
          </button>
          <button
            onClick={handleAddCart}
            disabled={product.stock === 0}
            className="flex-1 bg-brand-rose hover:bg-brand-rose-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] select-none cursor-pointer"
          >
            <ShoppingBag size={13} />
            Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
