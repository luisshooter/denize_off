import { useState } from 'react';
import { DatabaseZap, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SystemTab() {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<{ applied: string[]; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRun = async () => {
    if (!password.trim()) return;
    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    try {
      const { data } = await api.post('/system/migrate', { password });
      setResult(data);
      setStatus('success');
      setPassword('');
      setConfirm(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Erro ao aplicar atualizações');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(212,80,159,0.12)' }}>
            <DatabaseZap size={20} className="text-brand-rose" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Aplicar Atualizações do Sistema</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Atualiza a estrutura do banco de dados para a versão mais recente</p>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 text-sm space-y-1"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}>
          <p className="font-semibold">O que esta operação faz:</p>
          <ul className="list-disc list-inside text-xs space-y-0.5" style={{ color: '#FDE68A' }}>
            <li>Adiciona colunas novas ao banco (seguro — nunca remove ou altera dados existentes)</li>
            <li>Pode ser executada múltiplas vezes sem risco</li>
            <li>Necessária após atualizações que adicionam funcionalidades ao sistema</li>
          </ul>
        </div>

        {status === 'success' && result && (
          <div className="rounded-xl p-4 space-y-2"
               style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: '#34D399' }}>
              <CheckCircle2 size={18} />
              {result.message}
            </div>
            <ul className="space-y-1">
              {result.applied.map((item, i) => (
                <li key={i} className="text-xs font-mono px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#6EE7B7' }}>
                  ✓ {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-xl px-4 py-3 flex items-start gap-2 text-sm"
               style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}>
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {errorMsg}
          </div>
        )}

        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <DatabaseZap size={18} />
            Aplicar Atualizações do Sistema
          </button>
        ) : (
          <div className="space-y-3 rounded-xl p-4"
               style={{ border: '1px solid rgba(212,80,159,0.25)', background: 'rgba(212,80,159,0.06)' }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck size={16} className="text-brand-rose" />
              Confirme sua senha para continuar
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRun()}
                className="input pr-10"
                placeholder="Digite sua senha de acesso"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={status === 'loading' || !password.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {status === 'loading'
                  ? <><Loader2 size={16} className="animate-spin" /> Aplicando...</>
                  : <><DatabaseZap size={16} /> Confirmar e Aplicar</>
                }
              </button>
              <button
                onClick={() => { setConfirm(false); setPassword(''); setStatus('idle'); }}
                className="btn-secondary flex-1"
                disabled={status === 'loading'}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-2">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Quando usar</h4>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Execute esta operação após instalar uma nova versão do sistema que adiciona funcionalidades ao banco de dados.
          Ela é equivalente ao comando{' '}
          <code className="px-1 rounded font-mono text-brand-rose" style={{ background: 'rgba(212,80,159,0.1)' }}>
            npm run migrate
          </code>
          {' '}no servidor, mas pode ser feita diretamente pelo painel sem acesso ao terminal.
        </p>
      </div>
    </div>
  );
}
