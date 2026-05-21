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
  { value: '',           label: 'Todos' },
  { value: 'pending',    label: 'Pendente' },
  { value: 'confirmed',  label: 'Confirmado' },
  { value: 'processing', label: 'Processando' },
  { value: 'delivered',  label: 'Entregue' },
  { value: 'cancelled',  label: 'Cancelado' },
];

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  pending:    { label: 'Pendente',    bg: 'rgba(234,179,8,0.15)',  color: '#CA8A04' },
  confirmed:  { label: 'Confirmado', bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  processing: { label: 'Processando',bg: 'rgba(168,85,247,0.15)', color: '#A855F7' },
  delivered:  { label: 'Entregue',   bg: 'rgba(34,197,94,0.15)',  color: '#22C55E' },
  cancelled:  { label: 'Cancelado',  bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Orders() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded,     setExpanded]     = useState<string | null>(null);

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
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Pedidos
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(({ value, label }) => {
          const active = statusFilter === value;
          const s = value ? STATUS_MAP[value] : null;
          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer"
              style={
                active && s
                  ? { background: s.bg, color: s.color, border: `1px solid ${s.color}40` }
                  : active
                  ? { background: 'linear-gradient(135deg,#D4509F,#A83380)', color: '#fff', border: '1px solid transparent' }
                  : { background: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--card-border)' }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {loading ? (
          <div className="card flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-14" style={{ color: 'var(--text-muted)' }}>
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-25" />
            <p className="font-medium">Nenhum pedido encontrado</p>
          </div>
        ) : orders.map(order => {
          const s = STATUS_MAP[order.status] || { label: order.status, bg: 'rgba(107,114,128,0.15)', color: '#6B7280' };
          const isOpen = expanded === order.id;

          return (
            <div
              key={order.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              {/* Summary row */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer transition-colors duration-150"
                style={{ borderBottom: isOpen ? '1px solid var(--card-border)' : 'none' }}
                onClick={() => setExpanded(isOpen ? null : order.id)}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(212,80,159,0.04)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ChevronDown
                    size={15}
                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {order.customer_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {order.customer_phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm text-brand-rose">
                    {fmt(parseFloat(String(order.total)))}
                  </span>
                  <span
                    className="badge text-xs font-semibold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div
                  className="p-4 space-y-4"
                  style={{ background: 'rgba(212,80,159,0.025)' }}
                >
                  {/* Items */}
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Itens do Pedido
                    </p>
                    <div className="space-y-1.5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span style={{ color: 'var(--text-primary)' }}>
                            {item.name}{' '}
                            <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                          </span>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {fmt(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status update */}
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Atualizar Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.filter(s => s.value).map(({ value, label }) => {
                        const ms = STATUS_MAP[value];
                        const isCurrent = order.status === value;
                        return (
                          <button
                            key={value}
                            onClick={() => !isCurrent && updateStatus(order.id, value)}
                            disabled={isCurrent}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:cursor-default"
                            style={
                              isCurrent
                                ? { background: ms.bg, color: ms.color, opacity: 0.7 }
                                : { background: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--card-border)' }
                            }
                            onMouseEnter={e => {
                              if (!isCurrent) {
                                (e.currentTarget as HTMLElement).style.background = ms.bg;
                                (e.currentTarget as HTMLElement).style.color = ms.color;
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isCurrent) {
                                (e.currentTarget as HTMLElement).style.background = 'var(--card-bg)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                              }
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
