const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[DB] Erro inesperado no pool:', err.message);
});

// Neon free tier pausa após 5 min de inatividade.
// Ping a cada 4 min mantém o banco acordado.
setInterval(() => {
  pool.query('SELECT 1').catch(() => {});
}, 4 * 60 * 1000);

module.exports = pool;
