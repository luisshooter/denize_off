CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(255),
  price_normal DECIMAL(10,2) NOT NULL CHECK (price_normal > 0),
  price_promotion DECIMAL(10,2) CHECK (price_promotion > 0),
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  gender VARCHAR(20) NOT NULL DEFAULT 'feminino' CHECK (gender IN ('feminino', 'masculino', 'misto')),
  payment_method_ids JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name VARCHAR(255) NOT NULL DEFAULT 'Beauty Store',
  whatsapp_number VARCHAR(30),
  default_message TEXT DEFAULT 'Olá! 👋 Gostaria de fazer um pedido.',
  logo_url TEXT,
  banner_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  address TEXT,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '["maquiagem","skincare","cabelo","corpo","perfumes","unhas","outros"]'::jsonb,
  whatsapp_template_single TEXT DEFAULT NULL,
  whatsapp_template_multiple TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_config_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO config (id, store_name, default_message)
VALUES (1, 'Beauty Store', 'Olá! 👋 Gostaria de fazer um pedido.')
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
