import { useEffect, useState } from 'react';
import { ShoppingBag, Package, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  pending:    { label: 'Pendente',     bg: 'rgba(234,179,8,0.12)',   color: '#CA8A04' },
  confirmed:  { label: 'Confirmado',  bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
  processing: { label: 'Processando', bg: 'rgba(168,85,247,0.12)',  color: '#A855F7' },
  delivered:  { label: 'Entregue',    bg: 'rgba(34,197,94,0.12)',   color: '#16A34A' },
  cancelled:  { label: 'Cancelado',   bg: 'rgba(239,68,68,0.12)',   color: '#EF4444' },
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
    {
      label: 'Total de Pedidos',
      value: String(stats.totalOrders),
      icon: ShoppingBag,
      gradient: 'linear-gradient(135deg, #D4509F, #A83380)',
      glow: 'rgba(212,80,159,0.25)',
      link: '/pedidos',
    },
    {
      label: 'Pedidos Pendentes',
      value: String(stats.pendingOrders),
      icon: Clock,
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      glow: 'rgba(245,158,11,0.22)',
      link: '/pedidos',
    },
    {
      label: 'Receita (últimos 5)',
      value: fmt(stats.totalRevenue),
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      glow: 'rgba(16,185,129,0.22)',
      link: null,
    },
    {
      label: 'Produtos Ativos',
      value: String(stats.activeProducts),
      icon: Package,
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
      glow: 'rgba(139,92,246,0.22)',
      link: '/produtos',
    },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-[3px] border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Visão Geral
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Resumo das últimas atividades
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, gradient, glow, link }) => {
          const inner = (
            <div
              key={label}
              className="stat-card group"
              style={{ '--glow': glow } as React.CSSProperties}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: gradient, boxShadow: `0 4px 16px ${glow}` }}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-xl font-bold truncate mt-0.5 leading-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            </div>
          );
          return link ? (
            <Link key={label} to={link} className="block no-underline">{inner}</Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      {/* Pedidos recentes */}
      <div className="card glow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Pedidos Recentes
          </h3>
          <Link
            to="/pedidos"
            className="flex items-center gap-1 text-xs font-semibold transition-colors"
            style={{ color: '#D4509F' }}
          >
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Nenhum pedido ainda
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    {['Cliente', 'Total', 'Status', 'Data'].map(h => (
                      <th key={h} className="pb-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const s = STATUS_MAP[order.status] || { label: order.status, bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF' };
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors duration-150 cursor-default"
                        style={{ borderBottom: '1px solid var(--card-border)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,80,159,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {order.customer_name}
                        </td>
                        <td className="py-3 font-bold text-brand-rose">
                          {fmt(parseFloat(String(order.total)))}
                        </td>
                        <td className="py-3">
                          <span className="badge text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — melhor para WebView */}
            <div className="flex flex-col gap-2 sm:hidden">
              {recentOrders.map(order => {
                const s = STATUS_MAP[order.status] || { label: order.status, bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF' };
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(212,80,159,0.03)', border: '1px solid var(--card-border)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {order.customer_name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-bold text-sm text-brand-rose">
                        {fmt(parseFloat(String(order.total)))}
                      </span>
                      <span className="badge text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
