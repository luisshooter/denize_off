import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
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

  const displayName = store_name || 'Denize Off';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const base = isMasc ? '/masculino/produtos' : '/produtos';
      navigate(`${base}?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const headerStyle = isMasc
    ? { background: 'rgba(10,9,8,0.94)', backdropFilter: 'blur(16px)', borderColor: 'rgba(196,154,108,0.18)' }
    : { background: 'rgba(250,246,241,0.95)', backdropFilter: 'blur(16px)', borderColor: 'rgba(61,18,37,0.08)' };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-30 border-b"
        style={headerStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link to={isMasc ? '/masculino' : '/'} className="flex items-center gap-3 flex-shrink-0">
              {logo_url ? (
                <img src={logo_url} alt={displayName} className="h-9 w-auto object-contain max-w-[140px]" />
              ) : (
                <>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #C49A6C, #A07845)',
                      boxShadow: isMasc
                        ? '0 2px 10px rgba(196,154,108,0.35)'
                        : '0 2px 10px rgba(196,154,108,0.25)',
                    }}
                  >
                    <span
                      className="font-bold text-sm leading-none"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: isMasc ? '#0A0908' : '#3D1225' }}
                    >
                      {displayName[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span
                    className="font-bold text-lg hidden sm:block tracking-wide"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: isMasc ? '#E8D5B7' : '#1A0A10',
                      letterSpacing: '0.03em',
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
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: isMasc ? '#6B6258' : '#8C7378' }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none"
                  style={isMasc
                    ? {
                        background: 'rgba(26,23,20,0.80)',
                        border: '1px solid rgba(196,154,108,0.22)',
                        color: '#E8D5B7',
                      }
                    : {
                        background: 'rgba(245,239,233,0.80)',
                        border: '1px solid rgba(61,18,37,0.10)',
                        color: '#1A0A10',
                      }
                  }
                />
              </div>
            </form>

            {/* Nav — gender switcher */}
            <nav className="hidden md:flex items-center gap-0.5">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer tracking-wide"
                style={!pathname.startsWith('/masculino')
                  ? {
                      background: 'rgba(61,18,37,0.08)',
                      color: '#3D1225',
                      borderBottom: '1.5px solid #C49A6C',
                    }
                  : { color: isMasc ? '#6B6258' : '#8C7378' }
                }
              >
                Para Ela
              </Link>
              <Link
                to="/masculino"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer tracking-wide"
                style={pathname.startsWith('/masculino')
                  ? {
                      background: 'rgba(196,154,108,0.12)',
                      color: '#C49A6C',
                      borderBottom: '1.5px solid #C49A6C',
                    }
                  : { color: isMasc ? '#6B6258' : '#8C7378' }
                }
              >
                Para Ele
              </Link>
              {!isMasc && (
                <Link
                  to="/produtos"
                  className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer"
                  style={{ color: pathname === '/produtos' ? '#3D1225' : '#8C7378' }}
                >
                  Todos
                </Link>
              )}
              {isMasc && (
                <Link
                  to="/masculino/produtos"
                  className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer"
                  style={{ color: pathname === '/masculino/produtos' ? '#C49A6C' : '#6B6258' }}
                >
                  Coleção
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-full transition-all duration-200 cursor-pointer"
                style={{ color: isMasc ? '#6B6258' : '#8C7378' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#C49A6C';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,108,0.10)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = isMasc ? '#6B6258' : '#8C7378';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
                aria-label="Abrir carrinho"
              >
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
                    style={{ background: '#C49A6C', color: isMasc ? '#0A0908' : '#3D1225' }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden p-2.5 rounded-full transition-colors cursor-pointer"
                style={{ color: isMasc ? '#6B6258' : '#8C7378' }}
                aria-label="Menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div
              className="md:hidden border-t py-4 space-y-2 animate-fade-in"
              style={{ borderColor: isMasc ? 'rgba(196,154,108,0.12)' : 'rgba(61,18,37,0.07)' }}
            >
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: isMasc ? '#6B6258' : '#8C7378' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={isMasc
                      ? { background: 'rgba(26,23,20,0.80)', border: '1px solid rgba(196,154,108,0.22)', color: '#E8D5B7' }
                      : { background: 'rgba(245,239,233,0.80)', border: '1px solid rgba(61,18,37,0.10)', color: '#1A0A10' }
                    }
                  />
                </div>
              </form>

              <div className="flex gap-2 mb-2">
                <Link
                  to="/" onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={!pathname.startsWith('/masculino')
                    ? { background: 'rgba(61,18,37,0.08)', color: '#3D1225' }
                    : { color: '#8C7378', background: 'transparent' }
                  }
                >
                  Para Ela
                </Link>
                <Link
                  to="/masculino" onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={pathname.startsWith('/masculino')
                    ? { background: 'rgba(196,154,108,0.12)', color: '#C49A6C' }
                    : { color: '#8C7378', background: 'transparent' }
                  }
                >
                  Para Ele
                </Link>
              </div>

              {isMasc ? (
                <Link to="/masculino/produtos" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
                  style={{ color: '#E8D5B7' }}>
                  Ver Coleção Masculina
                </Link>
              ) : (
                <Link to="/produtos" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
                  style={{ color: '#3D1225' }}>
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
