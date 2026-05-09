import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, Flower2 } from 'lucide-react';

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
           style={{ background: 'linear-gradient(145deg, #110E1C 0%, #1E1B2E 60%, #2A1040 100%)' }}>

        {/* Orbs decorativos — CSS only, sem JS */}
        <div className="orb w-80 h-80 top-[-60px] left-[-60px] animate-glow-pulse"
             style={{ background: 'radial-gradient(circle, rgba(212,80,159,0.35), transparent 70%)' }} />
        <div className="orb w-64 h-64 bottom-[-40px] right-[-40px] animate-float-delayed"
             style={{ background: 'radial-gradient(circle, rgba(168,51,128,0.25), transparent 70%)' }} />
        <div className="orb w-48 h-48 top-1/2 right-1/4 animate-float"
             style={{ background: 'radial-gradient(circle, rgba(244,208,63,0.15), transparent 70%)' }} />

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
                 className="absolute rounded-full bg-brand-rose/40 animate-glow-pulse"
                 style={{ top: p.top, left: p.left, width: p.size, height: p.size, animationDelay: p.delay }} />
          ))}
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 text-center px-12 max-w-sm animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-glow-rose"
               style={{ background: 'linear-gradient(135deg, #D4509F, #A83380)' }}>
            <Sparkles size={34} className="text-white" />
          </div>

          <h1 className="font-display text-4xl font-bold text-white mb-3 leading-tight">
            Beauty Store
          </h1>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Gerencie sua loja com elegância e praticidade.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { title: 'Produtos', sub: 'Catálogo completo' },
              { title: 'Pedidos',  sub: 'Gestão eficiente' },
              { title: 'Dados',    sub: 'Tempo real' },
            ].map(({ title, sub }) => (
              <div key={title}
                   className="rounded-xl p-3 text-center transition-all duration-300 hover:bg-white/10"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/40 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Badge beauty */}
          <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full"
               style={{ background: 'rgba(212,80,159,0.15)', border: '1px solid rgba(212,80,159,0.3)' }}>
            <Flower2 size={14} className="text-brand-rose" />
            <span className="text-brand-rose-light text-xs font-medium">Painel Administrativo</span>
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário ─────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 transition-colors duration-300"
           style={{ background: 'var(--page-bg)' }}>
        <div className="w-full max-w-md animate-fade-in">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-rose"
                 style={{ background: 'linear-gradient(135deg, #D4509F, #A83380)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Beauty Store
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
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-rose/60" />
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
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-rose/60" />
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
