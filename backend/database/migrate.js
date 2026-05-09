require('dotenv').config({ path: `${__dirname}/../.env` });
const pool = require('../src/config/db');

async function migrate() {
  await pool.query(`
    ALTER TABLE config
      ADD COLUMN IF NOT EXISTS payment_methods        JSONB   DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS whatsapp_template_single   TEXT,
      ADD COLUMN IF NOT EXISTS whatsapp_template_multiple TEXT
  `);
  console.log('✓ config: +payment_methods, +whatsapp_template_single, +whatsapp_template_multiple');

  await pool.query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS payment_method_ids JSONB DEFAULT NULL
  `);
  console.log('✓ products: +payment_method_ids');

  await pool.query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS brand VARCHAR(100) DEFAULT NULL
  `);
  console.log('✓ products: +brand');

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_status        ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_category      ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_brand         ON products(brand);
    CREATE INDEX IF NOT EXISTS idx_products_price_normal  ON products(price_normal);
    CREATE INDEX IF NOT EXISTS idx_products_created_at    ON products(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_products_status_cat    ON products(status, category);
  `);
  console.log('✓ products: índices criados');

  await pool.end();
  console.log('Migration concluída.');
}

migrate().catch(err => {
  console.error('Erro na migration:', err.message);
  process.exit(1);
});
