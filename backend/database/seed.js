require('dotenv').config({ path: `${__dirname}/../.env` });
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('ADMIN_PASSWORD deve ter ao menos 8 caracteres');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = $2, updated_at = NOW()`,
    [email.toLowerCase().trim(), hash]
  );
  console.log(`✓ Admin criado/atualizado: ${email}`);

  const whatsapp = process.env.WHATSAPP_NUMBER || '5546999720099';
  await pool.query(
    `INSERT INTO config (id, whatsapp_number, store_name, default_message)
     VALUES (1, $1, 'Denize Beauty', 'Olá! Vim pelo site e gostaria de fazer um pedido.')
     ON CONFLICT (id) DO UPDATE SET
       whatsapp_number = COALESCE(config.whatsapp_number, EXCLUDED.whatsapp_number)`,
    [whatsapp]
  );
  console.log(`✓ Config da loja: WhatsApp ${whatsapp}`);

  await pool.end();
}

seed().catch(err => {
  console.error('Erro no seed:', err.message);
  process.exit(1);
});
