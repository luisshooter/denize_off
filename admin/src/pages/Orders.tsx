import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, ShoppingBag } from 'lucide-react';
import api from '../services/api';

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

const STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Processando' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' }
];

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-dark">Pedidos</h2>
        <p className="text-gray-400 text-sm mt-1">{orders.length} pedido(s) encontrado(s)</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2 mb-5">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === value
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div
                  className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 flex-shrink-0 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-dark truncate">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-brand-rose">{fmt(parseFloat(String(order.total)))}</span>
                    <span className={`badge ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUSES.find(s => s.value === order.status)?.label || order.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {expanded === order.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Itens do Pedido</p>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-brand-dark">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                            <span className="font-semibold text-brand-dark">{fmt(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Atualizar Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.filter(s => s.value).map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => updateStatus(order.id, value)}
                            disabled={order.status === value}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              order.status === value
                                ? `${STATUS_STYLE[value]} opacity-60 cursor-default`
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-rose hover:text-brand-rose'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
