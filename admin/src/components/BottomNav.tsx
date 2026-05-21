import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, ShoppingBag, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Início' },
  { to: '/produtos',       icon: Package,         label: 'Produtos' },
  { to: '/estoque',        icon: BarChart3,        label: 'Estoque' },
  { to: '/pedidos',        icon: ShoppingBag,      label: 'Pedidos' },
  { to: '/configuracoes',  icon: Settings,         label: 'Config' },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        background: 'var(--sidebar-bg)',
        borderTop: '1px solid rgba(212,80,159,0.15)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors duration-150"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-10 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
                    isActive ? 'bg-brand-rose/20' : ''
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-brand-rose' : 'text-white/40'}
                  />
                </div>
                <span
                  className={`text-[9px] font-semibold tracking-wide transition-colors ${
                    isActive ? 'text-brand-rose' : 'text-white/35'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
