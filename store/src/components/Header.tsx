import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import Cart from './Cart';

export default function Header() {
  const { count } = useCart();
  const { store_name, logo_url } = useStoreConfig();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const displayName = store_name || 'Beauty Store';

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
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-brand-sand/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              {logo_url ? (
                <img src={logo_url} alt={displayName} className="h-9 w-auto object-contain max-w-[140px]" />
              ) : (
                <>
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-rose to-brand-rose-dark rounded-xl flex items-center justify-center shadow-rose flex-shrink-0">
                    <span className="text-white font-display font-bold text-sm leading-none">{displayName[0]?.toUpperCase()}</span>
                  </div>
                  <span className="font-display font-bold text-lg text-brand-dark hidden sm:block">{displayName}</span>
                </>
              )}
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex">
              <div className="relative w-full">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full bg-brand-cream border border-brand-sand rounded-full pl-10 pr-4 py-2.5 text-sm text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-rose/25 focus:border-brand-rose focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              <Link to="/" className="btn-ghost text-sm">Início</Link>
              <Link to="/produtos" className="btn-ghost text-sm">Produtos</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-brand-rose-light transition-colors text-brand-muted hover:text-brand-rose"
                aria-label="Abrir carrinho"
              >
                <ShoppingBag size={21} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden p-2.5 rounded-full hover:bg-brand-cream transition-colors text-brand-muted"
                aria-label="Menu"
              >
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-brand-sand/50 py-4 space-y-2 animate-fade-in">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full bg-brand-cream border border-brand-sand rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose/25 focus:border-brand-rose focus:bg-white transition-all"
                  />
                </div>
              </form>
              <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-brand-dark rounded-xl hover:bg-brand-cream transition-colors">Início</Link>
              <Link to="/produtos" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-brand-dark rounded-xl hover:bg-brand-cream transition-colors">Produtos</Link>
            </div>
          )}
        </div>
      </header>
      <div className="h-16" />
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
