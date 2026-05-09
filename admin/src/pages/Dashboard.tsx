import { useEffect, useState } from 'react';
import { ShoppingBag, Package, DollarSign, Clock } from 'lucide-react';
import api from '../services/api';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

interface Order {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  pending:    { label: 'Pendente',    bg: 'rgba(234,179,8,0.15)',   color: '#EAB308' },
  confirmed:  { label: 'Confirmado', bg: 'rgba(59,130,246,0.15)',  color: '#60A5FA' },
  processing: { label: 'Processando',bg: 'rgba(168,85,247,0.15)', color: '#C084FC' },
  delivered:  { label: 'Entregue',   bg: 'rgba(34,197,94,0.15)',  color: '#4ADE80' },
  cancelled:  { label: 'Cancelado',  bg: 'rgba(239,68,68,0.15)',  color: '#F87171' },
};

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders?limit=5'),
      api.get('/products?limit=1&status=active'),
    ]).then(([ordersRes, productsRes]) => {
      const orders: Order[] = ordersRes.data.orders;
      const total   = ordersRes.data.pagination.total;
      const pending = orders.filter(o => o.status === 'pending').length;
      const revenue = orders.reduce((s, o) => s + parseFloat(String(o.total)), 0);
      setStats({ totalOrders: total, pendingOrders: pending, totalRevenue: revenue, activeProducts: productsRes.data.pagination.total });
      setRecentOrders(orders);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total de Pedidos',   value: String(stats.totalOrders),    icon: ShoppingBag, gradient: 'linear-gradient(135deg, #D4509F, #A83380)' },
    { label: 'Pedidos Pendentes',  value: String(stats.pendingOrders),  icon: Clock,       gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
    { label: 'Receita (últimos 5)',value: fmt(stats.totalRevenue),      icon: DollarSign,  gradient: 'linear-gradient(135deg, #10B981, #059669)' },
    { label: 'Produtos Ativos',    value: String(stats.activeProducts), icon: Package,     gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Título */}
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Visão Geral
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Resumo das últimas atividades
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className="card glow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                 style={{ background: gradient }}>
              <Icon size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos recentes */}
      <div className="card glow-card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Pedidos Recentes
        </h3>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Nenhum pedido ainda
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Cliente', 'Total', 'Status', 'Data'].map(h => (
                    <th key={h} className="pb-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const s = STATUS_MAP[order.status] || { label: order.status, bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF' };
                  return (
                    <tr key={order.id}
                        className="transition-colors duration-150"
                        style={{ borderBottom: '1px solid var(--card-border)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,80,159,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {order.customer_name}
                      </td>
                      <td className="py-3 font-semibold text-brand-rose">
                        {fmt(parseFloat(String(order.total)))}
                      </td>
                      <td className="py-3">
                        <span className="badge text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="py-3" style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
