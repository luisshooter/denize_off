const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/migrate', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória para executar esta operação' });
    }

    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    const applied = [];

    await pool.query(`
      ALTER TABLE config
        ADD COLUMN IF NOT EXISTS payment_methods         JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS whatsapp_template_single    TEXT,
        ADD COLUMN IF NOT EXISTS whatsapp_template_multiple  TEXT
    `);
    applied.push('config: +payment_methods, +whatsapp_template_single, +whatsapp_template_multiple');

    await pool.query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS payment_method_ids JSONB DEFAULT NULL
    `);
    applied.push('products: +payment_method_ids');

    res.json({
      applied,
      message: `${applied.length} grupo(s) de atualizações aplicado(s) com sucesso`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
