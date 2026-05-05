import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Cart from './Cart';

export default function Header() {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/produtos?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-rose to-brand-rose-dark rounded-lg flex items-center justify-center shadow-md">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-brand-dark hidden sm:block">Beauty Store</span>
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar produtos de beleza..."
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30 focus:border-brand-rose transition-colors"
                />
              </div>
            </form>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-rose transition-colors rounded-xl hover:bg-brand-rose-light">Início</Link>
              <Link to="/produtos" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-rose transition-colors rounded-xl hover:bg-brand-rose-light">Produtos</Link>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl hover:bg-brand-rose-light transition-colors text-gray-600 hover:text-brand-rose"
              >
                <ShoppingBag size={22} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-rose text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/30 focus:border-brand-rose"
                  />
                </div>
              </form>
              <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-brand-rose-light hover:text-brand-rose">Início</Link>
              <Link to="/produtos" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-brand-rose-light hover:text-brand-rose">Produtos</Link>
            </div>
          )}
        </div>
      </header>
      <div className="h-16" />
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
