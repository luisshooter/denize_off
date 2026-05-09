import { useEffect, useState } from 'react';
import { Store, MessageCircle, CreditCard, KeyRound, DatabaseZap } from 'lucide-react';
import api from '../services/api';
import StoreTab from './settings/StoreTab';
import WhatsappTab from './settings/WhatsappTab';
import PaymentsTab, { type PaymentMethod } from './settings/PaymentsTab';
import AccountTab from './settings/AccountTab';
import SystemTab from './settings/SystemTab';

type Tab = 'loja' | 'whatsapp' | 'pagamentos' | 'conta' | 'sistema';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'loja', label: 'Loja', icon: <Store size={16} /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={16} /> },
  { id: 'pagamentos', label: 'Pagamentos', icon: <CreditCard size={16} /> },
  { id: 'conta', label: 'Conta', icon: <KeyRound size={16} /> },
  { id: 'sistema', label: 'Sistema', icon: <DatabaseZap size={16} /> },
];

interface ConfigData {
  store_name: string;
  address: string;
  logo_url: string;
  banner_url: string;
  instagram_url: string;
  facebook_url: string;
  whatsapp_number: string;
  default_message: string;
  whatsapp_template_single: string;
  whatsapp_template_multiple: string;
  payment_methods: PaymentMethod[];
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('loja');
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api.get('/config/admin').then(({ data }) => {
      setConfig({
        store_name: data.store_name || '',
        address: data.address || '',
        logo_url: data.logo_url || '',
        banner_url: data.banner_url || '',
        instagram_url: data.instagram_url || '',
        facebook_url: data.facebook_url || '',
        whatsapp_number: data.whatsapp_number || '',
        default_message: data.default_message || '',
        whatsapp_template_single: data.whatsapp_template_single || '',
        whatsapp_template_multiple: data.whatsapp_template_multiple || '',
        payment_methods: Array.isArray(data.payment_methods) ? data.payment_methods : [],
      });
    }).catch(() => {
      setLoadError('Erro ao carregar configurações. Tente recarregar a página.');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (loadError) return (
    <div className="max-w-2xl">
      <div className="px-4 py-3 rounded-xl text-sm"
           style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
        ⚠ {loadError}
      </div>
    </div>
  );

  if (!config) return null;

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Configurações</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Gerencie sua loja por seção</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--card-border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={activeTab === tab.id
              ? { background: 'var(--card-bg)', color: '#D4509F', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }
              : { color: 'var(--text-muted)' }
            }
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'loja' && (
          <StoreTab initial={{
            store_name: config.store_name,
            address: config.address,
            logo_url: config.logo_url,
            banner_url: config.banner_url,
            instagram_url: config.instagram_url,
            facebook_url: config.facebook_url,
          }} />
        )}
        {activeTab === 'whatsapp' && (
          <WhatsappTab initial={{
            whatsapp_number: config.whatsapp_number,
            default_message: config.default_message,
            whatsapp_template_single: config.whatsapp_template_single,
            whatsapp_template_multiple: config.whatsapp_template_multiple,
          }} />
        )}
        {activeTab === 'pagamentos' && (
          <PaymentsTab initial={config.payment_methods} />
        )}
        {activeTab === 'conta' && <AccountTab />}
        {activeTab === 'sistema' && <SystemTab />}
      </div>
    </div>
  );
}
