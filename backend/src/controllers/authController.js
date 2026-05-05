const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');

const generateTokens = (userId, role) => ({
  accessToken: jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'beauty-store'
  }),
  refreshToken: jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'beauty-store'
  })
});

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Constant-time comparison prevents user enumeration via timing
    const dummy = '$2b$12$dummyhashtopreventtimingattacksxxxxxxxxxxxxxxxxxxxxxxxxx';
    const user = rows[0];
    const valid = await bcrypt.compare(password, user?.password_hash || dummy);

    if (!user || !valid) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, hashToken(refreshToken)]
    );

    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()',
      [user.id]
    );

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { issuer: 'beauty-store' });
    } catch {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    const { rows } = await pool.query(
      `SELECT rt.id, u.id as user_id, u.email, u.role
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.user_id = $1 AND rt.token_hash = $2 AND rt.expires_at > NOW()`,
      [decoded.id, hashToken(refreshToken)]
    );

    if (!rows[0]) return res.status(401).json({ error: 'Token inválido ou expirado' });

    const tokens = generateTokens(rows[0].user_id, rows[0].role);

    await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [rows[0].id]);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [rows[0].user_id, hashToken(tokens.refreshToken)]
    );

    res.json(tokens);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.query(
        'DELETE FROM refresh_tokens WHERE token_hash = $1',
        [hashToken(refreshToken)]
      );
    }
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
