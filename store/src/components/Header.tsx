import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Sparkles, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useTheme } from '../context/ThemeContext';
import Cart from './Cart';

export default function Header() {
  const { count } = useCart();
  const { store_name, logo_url } = useStoreConfig();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMasc = theme === 'masculino';

  const displayName = store_name || 'Beauty Store';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const base = isMasc ? '/masculino/produtos' : '/produtos';
      navigate(`${base}?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const headerClass = isMasc
    ? 'fixed top-0 left-0 right-0 z-30 border-b shadow-lg'
    : 'fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-brand-sand/60 shadow-sm';

  const headerStyle = isMasc
    ? { background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(202,138,4,0.2)' }
    : {};

  return (
    <>
      <header className={headerClass} style={headerStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link to={isMasc ? '/masculino' : '/'} className="flex items-center gap-2.5 flex-shrink-0">
              {logo_url ? (
                <img src={logo_url} alt={displayName} className="h-9 w-auto object-contain max-w-[140px]" />
              ) : (
                <>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={isMasc
                      ? { background: 'linear-gradient(135deg, #CA8A04, #A16207)', boxShadow: '0 3px 12px rgba(202,138,4,0.4)' }
                      : { background: 'linear-gradient(135deg, #D4509F, #A83380)', boxShadow: '0 3px 12px rgba(212,80,159,0.3)' }
                    }
                  >
                    <span
                      className="font-display font-bold text-sm leading-none"
                      style={{ color: isMasc ? '#0C0A09' : '#fff' }}
                    >
                      {displayName[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span
                    className="font-bold text-lg hidden sm:block"
                    style={{
                      fontFamily: isMasc ? "'Bodoni Moda', Georgia, serif" : "'Playfair Display', Georgia, serif",
                      color: isMasc ? '#F5F0EB' : '#1E1B2E',
                    }}
                  >
                    {displayName}
                  </span>
                </>
              )}
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex">
              <div className="relative w-full">
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: isMasc ? '#78716C' : '#9B8FA0' }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none"
                  style={isMasc
                    ? {
                        background: 'rgba(28,25,23,0.8)',
                        border: '1px solid rgba(202,138,4,0.25)',
                        color: '#F5F0EB',
                      }
                    : {
                        background: '#FFF8F3',
                        border: '1px solid #EFE3D8',
                        color: '#1E1B2E',
                      }
                  }
                />
              </div>
            </form>

            {/* Nav — gender switcher + links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={!pathname.startsWith('/masculino')
                  ? { background: 'rgba(212,80,159,0.12)', color: '#D4509F' }
                  : { color: isMasc ? '#78716C' : '#9B8FA0' }
                }
              >
                <Sparkles size={13} />
                Para Ela
              </Link>
              <Link
                to="/masculino"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={pathname.startsWith('/masculino')
                  ? { background: 'rgba(202,138,4,0.15)', color: '#CA8A04' }
                  : { color: isMasc ? '#78716C' : '#9B8FA0' }
                }
              >
                <Flame size={13} />
                Para Ele
              </Link>
              {!isMasc && (
                <Link to="/produtos" className="btn-ghost text-sm">Todos</Link>
              )}
              {isMasc && (
                <Link
                  to="/masculino/produtos"
                  className="text-sm font-medium px-3 py-2 rounded-full transition-colors cursor-pointer"
                  style={{ color: pathname === '/masculino/produtos' ? '#CA8A04' : '#78716C' }}
                >
                  Coleção
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-full transition-colors"
                style={isMasc
                  ? { color: '#78716C' }
                  : { color: '#9B8FA0' }
                }
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = isMasc ? '#CA8A04' : '#D4509F';
                  (e.currentTarget as HTMLElement).style.background = isMasc ? 'rgba(202,138,4,0.08)' : 'rgba(212,80,159,0.08)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = isMasc ? '#78716C' : '#9B8FA0';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
                aria-label="Abrir carrinho"
              >
                <ShoppingBag size={21} />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
                    style={isMasc
                      ? { background: '#CA8A04', color: '#0C0A09' }
                      : { background: '#D4509F', color: '#fff' }
                    }
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden p-2.5 rounded-full transition-colors"
                style={{ color: isMasc ? '#78716C' : '#9B8FA0' }}
                aria-label="Menu"
              >
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div
              className="md:hidden border-t py-4 space-y-2 animate-fade-in"
              style={{ borderColor: isMasc ? 'rgba(202,138,4,0.15)' : 'rgba(239,227,216,0.5)' }}
            >
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: isMasc ? '#78716C' : '#9B8FA0' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none"
                    style={isMasc
                      ? { background: 'rgba(28,25,23,0.8)', border: '1px solid rgba(202,138,4,0.25)', color: '#F5F0EB' }
                      : { background: '#FFF8F3', border: '1px solid #EFE3D8', color: '#1E1B2E' }
                    }
                  />
                </div>
              </form>

              <div className="flex gap-2 mb-2">
                <Link
                  to="/" onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={!pathname.startsWith('/masculino')
                    ? { background: 'rgba(212,80,159,0.12)', color: '#D4509F' }
                    : { color: '#9B8FA0', background: 'transparent' }
                  }
                >
                  <Sparkles size={13} /> Para Ela
                </Link>
                <Link
                  to="/masculino" onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={pathname.startsWith('/masculino')
                    ? { background: 'rgba(202,138,4,0.15)', color: '#CA8A04' }
                    : { color: '#9B8FA0', background: 'transparent' }
                  }
                >
                  <Flame size={13} /> Para Ele
                </Link>
              </div>

              {isMasc ? (
                <Link to="/masculino/produtos" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
                  style={{ color: '#F5F0EB' }}>
                  Ver Coleção Masculina
                </Link>
              ) : (
                <Link to="/produtos" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-brand-dark rounded-xl hover:bg-brand-cream transition-colors">
                  Todos os Produtos
                </Link>
              )}
            </div>
          )}
        </div>
      </header>
      <div className="h-16" />
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
