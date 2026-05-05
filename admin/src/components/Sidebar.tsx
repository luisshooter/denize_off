import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, X, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/configuracoes', label: 'Configurações', icon: Settings }
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('Beauty Admin');

  useEffect(() => {
    api.get('/config').then(({ data }) => {
      if (data.logo_url) setLogoUrl(data.logo_url);
      if (data.store_name) setStoreName(data.store_name);
    }).catch(() => {});
  }, []);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
        bg-brand-dark text-white transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0 shadow-md border border-white/10"
                onError={() => setLogoUrl(null)}
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-brand-rose to-brand-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Sparkles size={16} />
              </div>
            )}
            <span className="font-display font-bold text-base truncate">{storeName}</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-brand-rose text-white shadow-lg shadow-brand-rose/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/50">Sistema online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
