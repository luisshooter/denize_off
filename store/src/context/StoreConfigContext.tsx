import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface PaymentMethod {
  id: string;
  type: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'other';
  label: string;
  enabled: boolean;
  installments?: number;
  min_installment?: number;
}

export interface StoreConfig {
  store_name: string;
  logo_url: string | null;
  payment_methods: PaymentMethod[];
  categories: string[];
  whatsapp_template_single: string;
  whatsapp_template_multiple: string;
}

const DEFAULT_SINGLE = `🌸 *Olá! Aqui é {nome}* 😊\n\nVim pelo site e gostaria de encomendar:\n\n✨ *{produto}*\n📦 Quantidade: {quantidade} unidade(s)\n💵 Valor unitário: {preco_unitario}\n\n💰 *Total: {total}*\n\nPode me confirmar a disponibilidade? 🙏💕`;
const DEFAULT_MULTIPLE = `🌸 *Olá! Aqui é {nome}* 😊\n\nVim pelo site e gostaria de encomendar:\n\n{lista}\n\n💰 *Total: {total}*\n\nPode me confirmar a disponibilidade? 🙏💕`;

const DEFAULT_CATEGORIES = ['maquiagem','skincare','cabelo','corpo','perfumes','unhas','outros'];

const defaultConfig: StoreConfig = {
  store_name: '',
  logo_url: null,
  payment_methods: [],
  categories: DEFAULT_CATEGORIES,
  whatsapp_template_single: DEFAULT_SINGLE,
  whatsapp_template_multiple: DEFAULT_MULTIPLE,
};

const StoreConfigContext = createContext<StoreConfig>(defaultConfig);

export function StoreConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<StoreConfig>(defaultConfig);

  useEffect(() => {
    api.get('/config').then(({ data }) => {
      setConfig({
        store_name: data.store_name || '',
        logo_url: data.logo_url || null,
        payment_methods: Array.isArray(data.payment_methods)
          ? data.payment_methods.filter((m: PaymentMethod) => m.enabled)
          : [],
        categories: Array.isArray(data.categories) && data.categories.length > 0
          ? data.categories
          : DEFAULT_CATEGORIES,
        whatsapp_template_single: data.whatsapp_template_single || DEFAULT_SINGLE,
        whatsapp_template_multiple: data.whatsapp_template_multiple || DEFAULT_MULTIPLE,
      });
    }).catch(() => {});
  }, []);

  return (
    <StoreConfigContext.Provider value={config}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export const useStoreConfig = () => useContext(StoreConfigContext);

export function installmentLabel(method: PaymentMethod, price: number): string | null {
  if (method.type !== 'credit_card' || !method.installments || method.installments <= 1) return null;
  const min = method.min_installment || 10;
  const maxX = Math.min(method.installments, Math.floor(price / min));
  if (maxX <= 1) return null;
  const val = price / maxX;
  return `${maxX}x de ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
}
