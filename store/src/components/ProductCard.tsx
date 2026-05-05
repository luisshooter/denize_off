import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageCircle, ImageOff, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_normal: number;
  price_promotion: number | null;
  image_url: string | null;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const price = product.price_promotion ?? product.price_normal;
  const discount = product.price_promotion
    ? Math.round((1 - product.price_promotion / product.price_normal) * 100)
    : 0;

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
    <div className="product-card" onClick={() => navigate(`/produto/${product.id}`)}>
      <div className="relative aspect-square bg-brand-rose-light overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={40} className="text-brand-rose/30" />
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-brand-rose text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag size={10} />
            -{discount}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1.5 rounded-full">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="text-xs font-medium text-brand-rose capitalize bg-brand-rose-light px-2 py-0.5 rounded-full">
          {product.category}
        </span>
        <h3 className="font-semibold text-brand-dark mt-2 mb-1 line-clamp-2 leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>
        )}

        <div className="flex items-end gap-2 mb-4">
          <span className="font-display text-xl font-bold text-brand-rose">{fmt(price)}</span>
          {product.price_promotion && (
            <span className="text-sm text-gray-400 line-through mb-0.5">{fmt(product.price_normal)}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCallNow}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <MessageCircle size={14} />
            Chamar
          </button>
          <button
            onClick={handleAddCart}
            disabled={product.stock === 0}
            className="flex-1 bg-brand-rose hover:bg-brand-rose-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={14} />
            Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
