import { LogOut, Bell, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';

const titles: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/produtos':      'Produtos',
  '/estoque':       'Estoque',
  '/pedidos':       'Pedidos',
  '/configuracoes': 'Configurações',
};

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate  = useNavigate();

  const title = titles[location.pathname] || 'Painel';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0"
      style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)',
      }}
    >
      {/* Left: Brand mark (mobile) + page title */}
      <div className="flex items-center gap-3">
        {/* Small brand icon visible only on mobile (sidebar hidden) */}
        <div
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center shadow-glow-rose flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #D4509F, #A83380)' }}
        >
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <p className="text-[11px] hidden sm:block mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Beauty Store Admin
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="p-2 rounded-xl transition-all duration-200 cursor-pointer"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(212,80,159,0.1)';
            (e.currentTarget as HTMLElement).style.color = '#D4509F';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,80,159,0.35)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-xl transition-all duration-200 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(212,80,159,0.1)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <Bell size={16} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-0.5 sm:mx-1" style={{ background: 'var(--card-border)' }} />

        {/* User + logout */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
              {user?.email.split('@')[0]}
            </p>
            <p className="text-[10px] mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
              {user?.role}
            </p>
          </div>

          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-glow-rose"
            style={{ background: 'linear-gradient(135deg, #D4509F, #A83380)' }}
          >
            {user?.email.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-xl transition-all duration-200 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
              (e.currentTarget as HTMLElement).style.color = '#F87171';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
