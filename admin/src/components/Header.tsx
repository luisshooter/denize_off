import { Menu, LogOut, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';

const titles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/produtos':     'Produtos',
  '/pedidos':      'Pedidos',
  '/configuracoes':'Configurações',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
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
      className="px-5 py-3.5 flex items-center justify-between transition-colors duration-300 flex-shrink-0"
      style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)',
      }}
    >
      {/* Esquerda */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,80,159,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Beauty Store Admin</p>
        </div>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-2">

        {/* Toggle dark/light */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="p-2 rounded-xl transition-all duration-200 group"
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
          {theme === 'dark'
            ? <Sun size={17} />
            : <Moon size={17} />
          }
        </button>

        {/* Notificações */}
        <button
          className="p-2 rounded-xl transition-all duration-200 relative"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,80,159,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell size={17} />
        </button>

        {/* Separador */}
        <div className="w-px h-6 mx-1" style={{ background: 'var(--card-border)' }} />

        {/* Usuário */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
              {user?.email.split('@')[0]}
            </p>
            <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
              {user?.role}
            </p>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-glow-rose"
               style={{ background: 'linear-gradient(135deg, #D4509F, #A83380)' }}>
            {user?.email.charAt(0).toUpperCase()}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-xl transition-all duration-200"
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
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
