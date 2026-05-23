import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, ShoppingBag, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Início' },
  { to: '/produtos',      icon: Package,         label: 'Produtos' },
  { to: '/estoque',       icon: BarChart3,        label: 'Estoque' },
  { to: '/pedidos',       icon: ShoppingBag,      label: 'Pedidos' },
  { to: '/configuracoes', icon: Settings,         label: 'Config' },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        background: 'var(--sidebar-bg)',
        borderTop: '1px solid rgba(212,80,159,0.13)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.25)',
      }}
    >
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200 select-none"
            style={{ minHeight: 60 }}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    width: 44,
                    height: 32,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(212,80,159,0.25), rgba(168,51,128,0.18))'
                      : 'transparent',
                    boxShadow: isActive ? '0 2px 8px rgba(212,80,159,0.2)' : 'none',
                  }}
                >
                  <Icon
                    size={21}
                    style={{
                      color: isActive ? '#D4509F' : 'rgba(255,255,255,0.35)',
                      transition: 'color 0.2s',
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wide transition-colors duration-200"
                  style={{ color: isActive ? '#D4509F' : 'rgba(255,255,255,0.3)' }}
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
