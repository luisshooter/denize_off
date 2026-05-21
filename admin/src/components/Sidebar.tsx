import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, Sparkles, Flower2, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/produtos',      label: 'Produtos',       icon: Package },
  { to: '/estoque',       label: 'Estoque',        icon: BarChart3 },
  { to: '/pedidos',       label: 'Pedidos',        icon: ShoppingBag },
  { to: '/configuracoes', label: 'Configurações',  icon: Settings },
];

export default function Sidebar() {
  const [logoUrl,   setLogoUrl]   = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Beauty Admin');

  useEffect(() => {
    api.get('/config').then(({ data }) => {
      if (data.logo_url)   setLogoUrl(data.logo_url);
      if (data.store_name) setStoreName(data.store_name);
    }).catch(() => {});
  }, []);

  return (
    <aside
      className="hidden lg:flex w-64 flex-col flex-shrink-0"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid rgba(212,80,159,0.1)' }}
    >
      {/* Decorative orb */}
      <div
        className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0 0, rgba(212,80,159,0.10), transparent 70%)' }}
      />

      {/* Brand */}
      <div
        className="flex items-center gap-3 px-5 py-5 relative"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={storeName}
            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
            style={{ border: '1px solid rgba(212,80,159,0.3)' }}
            onError={() => setLogoUrl(null)}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-rose"
            style={{ background: 'linear-gradient(135deg, #D4509F, #A83380)' }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
        )}
        <div className="min-w-0">
          <span className="font-display font-bold text-sm text-white truncate block">{storeName}</span>
          <span className="text-[10px] text-white/35 font-medium tracking-wide">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold tracking-widest uppercase text-white/25 px-3 mb-3">Menu</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group relative
              ${isActive ? 'text-white' : 'text-white/50 hover:text-white/85 hover:bg-white/6'}
            `}
            style={({ isActive }) =>
              isActive
                ? { background: 'linear-gradient(135deg, rgba(212,80,159,0.85), rgba(168,51,128,0.85))' }
                : undefined
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={
                    isActive ? 'text-white' : 'text-white/45 group-hover:text-white/75 transition-colors'
                  }
                />
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status footer */}
      <div className="px-3 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-4"
          style={{ background: 'rgba(212,80,159,0.07)', border: '1px solid rgba(212,80,159,0.14)' }}
        >
          <Flower2 size={13} className="text-brand-rose flex-shrink-0" />
          <div>
            <p className="text-[11px] font-medium text-white/65">Sistema online</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/30">Conectado</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
