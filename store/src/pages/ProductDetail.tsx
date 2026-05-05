import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageCircle, ArrowLeft, Tag, Package, ImageOff } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { Product } from '../components/ProductCard';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

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
    setTimeout(() => setAdded(false), 2000);
  };

  const handleCallNow = async () => {
    if (!product) return;
    try {
      const price = product.price_promotion ?? product.price_normal;
      const msg = `Olá! 👋 Gostaria de informações sobre:\n*${product.name}* — ${fmt(price)}`;
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

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-brand-rose transition-colors text-sm font-medium mb-8"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square bg-brand-rose-light rounded-3xl overflow-hidden shadow-lg">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff size={64} className="text-brand-rose/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-brand-rose capitalize bg-brand-rose-light px-3 py-1 rounded-full">
              {product.category}
            </span>
            {discount > 0 && (
              <span className="text-xs font-bold text-white bg-brand-rose px-2.5 py-1 rounded-full flex items-center gap-1">
                <Tag size={10} /> -{discount}%
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-brand-dark leading-tight mb-4">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-gray-500 leading-relaxed mb-6">{product.description}</p>
          )}

          <div className="flex items-end gap-3 mb-2">
            <span className="font-display text-4xl font-bold text-brand-rose">{fmt(price)}</span>
            {product.price_promotion && (
              <span className="text-xl text-gray-400 line-through mb-1">{fmt(product.price_normal)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-8">
            <Package size={14} className={product.stock === 0 ? 'text-red-400' : 'text-green-500'} />
            <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-400' : 'text-green-600'}`}>
              {product.stock === 0 ? 'Produto esgotado' : `${product.stock} em estoque`}
            </span>
          </div>

          <div className="space-y-3 mt-auto">
            <button
              onClick={handleAddCart}
              disabled={product.stock === 0}
              className="btn-rose w-full text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={20} />
              {added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
            </button>
            <button onClick={handleCallNow} className="btn-whatsapp w-full text-base">
              <MessageCircle size={20} />
              Chamar pelo WhatsApp
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
