import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, X, Sparkles, Flower2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/produtos',     label: 'Produtos',       icon: Package },
  { to: '/pedidos',      label: 'Pedidos',        icon: ShoppingBag },
  { to: '/configuracoes',label: 'Configurações',  icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [logoUrl,   setLogoUrl]   = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Beauty Admin');

  useEffect(() => {
    api.get('/config').then(({ data }) => {
      if (data.logo_url)   setLogoUrl(data.logo_url);
      if (data.store_name) setStoreName(data.store_name);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 lg:hidden backdrop-blur-sm"
          style={{ background: 'rgba(10,8,18,0.6)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid rgba(212,80,159,0.1)' }}
      >
        {/* Orb decorativo no topo da sidebar */}
        <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
             style={{ background: 'radial-gradient(circle at 0 0, rgba(212,80,159,0.12), transparent 70%)' }} />

        {/* Header da sidebar */}
        <div className="flex items-center justify-between p-5 relative"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                style={{ border: '1px solid rgba(212,80,159,0.3)' }}
                onError={() => setLogoUrl(null)}
              />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-rose"
                   style={{ background: 'linear-gradient(135deg, #D4509F, #A83380)' }}>
                <Sparkles size={16} className="text-white" />
              </div>
            )}
            <span className="font-display font-bold text-base text-white truncate">{storeName}</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'text-white shadow-glow-rose'
                  : 'text-white/55 hover:text-white hover:bg-white/8'
                }
              `}
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, rgba(212,80,159,0.9), rgba(168,51,128,0.9))' }
                : undefined
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-white/55 group-hover:text-white transition-colors'} />
                  {label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer da sidebar */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
               style={{ background: 'rgba(212,80,159,0.08)', border: '1px solid rgba(212,80,159,0.15)' }}>
            <Flower2 size={14} className="text-brand-rose flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-white/70">Sistema online</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/35">Conectado</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
