import { X, Minus, Plus, ShoppingBag, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

interface CartProps {
  open: boolean;
  onClose: () => void;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Cart({ open, onClose }: CartProps) {
  const { items, count, total, removeItem, updateQty, clear } = useCart();

  const handleOrder = async () => {
    if (items.length === 0) return;
    const name = prompt('Seu nome:');
    if (!name?.trim()) return;
    const phone = prompt('Seu WhatsApp (somente números com DDD):');
    if (!phone?.trim()) return;

    try {
      const orderItems = items.map(i => ({ product_id: i.id, quantity: i.quantity }));
      await api.post('/orders', {
        customer_name: name.trim(),
        customer_phone: phone.trim().replace(/\D/g, ''),
        items: orderItems
      });

      const list = items.map(i => `• ${i.name} ×${i.quantity} — ${fmt(i.price * i.quantity)}`).join('\n');
      const msg = `Olá! 👋 Quero fazer um pedido:\n\n${list}\n\n*TOTAL: ${fmt(total)}*\n\nMeu nome: ${name.trim()}`;
      const { data } = await api.get(`/config/whatsapp-link?message=${encodeURIComponent(msg)}`);
      clear();
      onClose();
      window.open(data.link, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao enviar pedido. Tente novamente.');
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-rose" />
            <h2 className="font-semibold text-brand-dark">Carrinho ({count})</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Seu carrinho está vazio</p>
            <p className="text-sm mt-1">Adicione produtos para continuar</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-brand-rose-light flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={20} className="text-brand-rose/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-brand-dark truncate">{item.name}</p>
                    <p className="text-brand-rose font-semibold text-sm">{fmt(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-brand-rose hover:text-brand-rose transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-brand-rose hover:text-brand-rose transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-500">Total</span>
                <span className="font-display text-2xl font-bold text-brand-rose">{fmt(total)}</span>
              </div>
              <button onClick={handleOrder} className="btn-whatsapp w-full">
                <MessageCircle size={20} />
                Enviar Pedido pelo WhatsApp
              </button>
              <button
                onClick={clear}
                className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
              >
                Limpar carrinho
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
