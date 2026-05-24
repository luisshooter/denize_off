import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/produtos',      label: 'Produtos',      icon: Package },
  { to: '/estoque',       label: 'Estoque',       icon: BarChart3 },
  { to: '/pedidos',       label: 'Pedidos',       icon: ShoppingBag },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
  const [logoUrl,   setLogoUrl]   = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Denize Off');

  useEffect(() => {
    api.get('/config').then(({ data }) => {
      if (data.logo_url)   setLogoUrl(data.logo_url);
      if (data.store_name) setStoreName(data.store_name);
    }).catch(() => {});
  }, []);

  return (
    <aside
      className="hidden lg:flex w-64 flex-col flex-shrink-0"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid rgba(196,154,108,0.10)' }}
    >
      {/* Copper accent orb */}
      <div
        className="absolute top-0 left-0 w-56 h-56 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0 0, rgba(196,154,108,0.07), transparent 70%)' }}
      />

      {/* Brand */}
      <div
        className="flex items-center gap-3 px-5 py-5 relative"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={storeName}
            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
            style={{ border: '1px solid rgba(196,154,108,0.30)' }}
            onError={() => setLogoUrl(null)}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #C49A6C, #A07845)',
              boxShadow: '0 2px 12px rgba(196,154,108,0.35)',
            }}
          >
            <span className="font-display font-bold text-sm" style={{ color: '#0A0908' }}>
              {storeName[0]?.toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <span className="font-display font-bold text-sm text-white truncate block"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.02em' }}>
            {storeName}
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase"
            style={{ color: 'rgba(196,154,108,0.50)' }}>
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold tracking-widest uppercase px-3 mb-3"
          style={{ color: 'rgba(255,255,255,0.20)' }}>
          Menu
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group relative
              ${isActive ? 'text-white' : 'text-white/45 hover:text-white/80'}
            `}
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'linear-gradient(135deg, rgba(196,154,108,0.22), rgba(160,120,69,0.18))',
                    borderLeft: '2px solid #C49A6C',
                    paddingLeft: '10px',
                  }
                : { borderLeft: '2px solid transparent' }
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  style={{ color: isActive ? '#C49A6C' : undefined }}
                  className={isActive ? '' : 'text-white/35 group-hover:text-white/65 transition-colors'}
                />
                <span style={{ color: isActive ? '#E8D5B7' : undefined }}>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: '#C49A6C', opacity: 0.7 }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status footer */}
      <div className="px-3 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-4"
          style={{
            background: 'rgba(196,154,108,0.06)',
            border: '1px solid rgba(196,154,108,0.13)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.60)' }}>
              Sistema online
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(196,154,108,0.45)' }}>
              Conectado
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
