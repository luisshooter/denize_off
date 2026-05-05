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

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', class: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processando', class: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Entregue', class: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-700' }
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders?limit=5'),
      api.get('/products?limit=1&status=active')
    ]).then(([ordersRes, productsRes]) => {
      const orders: Order[] = ordersRes.data.orders;
      const total = ordersRes.data.pagination.total;
      const pending = orders.filter(o => o.status === 'pending').length;
      const revenue = orders.reduce((s, o) => s + parseFloat(String(o.total)), 0);
      setStats({
        totalOrders: total,
        pendingOrders: pending,
        totalRevenue: revenue,
        activeProducts: productsRes.data.pagination.total
      });
      setRecentOrders(orders);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total de Pedidos', value: String(stats.totalOrders), icon: ShoppingBag, color: 'from-brand-rose to-brand-rose-dark' },
    { label: 'Pedidos Pendentes', value: String(stats.pendingOrders), icon: Clock, color: 'from-amber-400 to-amber-500' },
    { label: 'Receita (últimos 5)', value: fmt(stats.totalRevenue), icon: DollarSign, color: 'from-emerald-400 to-emerald-500' },
    { label: 'Produtos Ativos', value: String(stats.activeProducts), icon: Package, color: 'from-violet-400 to-violet-500' }
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-dark">Visão Geral</h2>
        <p className="text-gray-400 text-sm mt-1">Resumo das últimas atividades</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}>
              <Icon size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-xl font-bold text-brand-dark truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-brand-dark mb-4">Pedidos Recentes</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Nenhum pedido ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(order => {
                  const s = STATUS_MAP[order.status] || { label: order.status, class: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-brand-dark">{order.customer_name}</td>
                      <td className="py-3 text-brand-rose font-semibold">{fmt(parseFloat(String(order.total)))}</td>
                      <td className="py-3">
                        <span className={`badge ${s.class}`}>{s.label}</span>
                      </td>
                      <td className="py-3 text-gray-400">
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
