import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/produtos': 'Produtos',
  '/pedidos': 'Pedidos',
  '/configuracoes': 'Configurações'
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] || 'Painel';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-brand-dark">{title}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">Beauty Store Admin</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
          <Bell size={18} className="text-gray-500" />
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-brand-dark">{user?.email.split('@')[0]}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-rose to-brand-rose-dark flex items-center justify-center text-white font-bold text-sm">
            {user?.email.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
