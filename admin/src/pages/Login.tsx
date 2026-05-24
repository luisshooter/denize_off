import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--page-bg)' }}>

      {/* ── Painel esquerdo — branding ─────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
           style={{ background: 'linear-gradient(145deg, #0A0908 0%, #1A1714 60%, #221810 100%)' }}>

        {/* Orbs decorativos */}
        <div className="orb w-80 h-80 top-[-60px] left-[-60px] animate-glow-pulse"
             style={{ background: 'radial-gradient(circle, rgba(196,154,108,0.22), transparent 70%)' }} />
        <div className="orb w-64 h-64 bottom-[-40px] right-[-40px] animate-float-delayed"
             style={{ background: 'radial-gradient(circle, rgba(61,18,37,0.40), transparent 70%)' }} />
        <div className="orb w-48 h-48 top-1/2 right-1/4 animate-float"
             style={{ background: 'radial-gradient(circle, rgba(160,120,69,0.15), transparent 70%)' }} />

        {/* Partículas decorativas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { top: '15%', left: '10%', size: 3, delay: '0s' },
            { top: '30%', left: '85%', size: 2, delay: '1s' },
            { top: '60%', left: '15%', size: 4, delay: '2s' },
            { top: '75%', left: '70%', size: 2, delay: '0.5s' },
            { top: '45%', left: '50%', size: 3, delay: '1.5s' },
          ].map((p, i) => (
            <div key={i}
                 className="absolute rounded-full animate-glow-pulse"
                 style={{ top: p.top, left: p.left, width: p.size, height: p.size,
                          background: 'rgba(196,154,108,0.50)', animationDelay: p.delay }} />
          ))}
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 text-center px-12 max-w-sm animate-fade-in">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #C49A6C, #A07845)',
              boxShadow: '0 4px 24px rgba(196,154,108,0.40)',
            }}
          >
            <span
              className="font-bold"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', color: '#1A0A10', lineHeight: 1 }}
            >
              A
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white mb-3 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.02em' }}>
            Painel Admin
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(232,213,183,0.55)' }}>
            Gerencie sua loja com elegância e praticidade.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { title: 'Produtos', sub: 'Catálogo completo' },
              { title: 'Pedidos',  sub: 'Gestão eficiente' },
              { title: 'Dados',    sub: 'Tempo real' },
            ].map(({ title, sub }) => (
              <div key={title}
                   className="rounded-xl p-3 text-center transition-all duration-300"
                   style={{ background: 'rgba(196,154,108,0.06)', border: '1px solid rgba(196,154,108,0.13)' }}
                   onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,108,0.12)'}
                   onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,108,0.06)'}
              >
                <p className="font-semibold text-sm" style={{ color: '#E8D5B7' }}>{title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(196,154,108,0.50)' }}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full"
               style={{ background: 'rgba(196,154,108,0.10)', border: '1px solid rgba(196,154,108,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C49A6C' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(232,213,183,0.70)' }}>
              Acesso Administrativo
            </span>
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário ─────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 transition-colors duration-300"
           style={{ background: 'var(--page-bg)' }}>
        <div className="w-full max-w-md animate-fade-in">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{
                   background: 'linear-gradient(135deg, #C49A6C, #A07845)',
                   boxShadow: '0 2px 12px rgba(196,154,108,0.35)',
                 }}>
              <span className="font-bold text-base leading-none"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1A0A10' }}>
                A
              </span>
            </div>
            <span className="font-display font-bold text-xl"
              style={{ color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Painel Admin
            </span>
          </div>

          {/* Card do formulário — com glow-card */}
          <div className="card glow-card rounded-2xl">

            {/* Header do card */}
            <div className="mb-7">
              <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Bem-vindo!
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Acesse o painel administrativo
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-start gap-2"
                   style={{
                     background: 'rgba(239,68,68,0.08)',
                     border: '1px solid rgba(239,68,68,0.25)',
                     color: '#F87171'
                   }}>
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-copper/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Senha
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-copper/60" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Botão */}
              <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={15} />
                    Entrar
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
            Painel restrito a administradores autorizados
          </p>
        </div>
      </div>
    </div>
  );
}
