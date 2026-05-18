const pool = require('../config/db');

const VALID_SORT = { created_at: true, price_normal: true, name: true, stock: true };

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const isAdmin = ['admin', 'superadmin'].includes(req.user?.role);

    const conditions = [];
    const params = [];

    if (!isAdmin) {
      conditions.push(`status = 'active'`);
      conditions.push(`stock > 0`);
    } else if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
      params.push(req.query.status);
      conditions.push(`status = $${params.length}`);
    }

    if (req.query.category) {
      params.push(req.query.category);
      conditions.push(`category = $${params.length}`);
    }

    if (req.query.brand) {
      params.push(req.query.brand);
      conditions.push(`brand = $${params.length}`);
    }

    if (req.query.promo === 'true') {
      conditions.push(`price_promotion IS NOT NULL`);
    }

    if (req.query.q) {
      params.push(`%${req.query.q.slice(0, 100)}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length} OR brand ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sort = VALID_SORT[req.query.sort] ? req.query.sort : 'created_at';
    const dir = req.query.dir === 'asc' ? 'ASC' : 'DESC';

    params.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT id, name, description, category, brand, price_normal, price_promotion,
              image_url, stock, status, payment_method_ids, created_at,
              COUNT(*) OVER() AS total_count
       FROM products ${where}
       ORDER BY ${sort} ${dir}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = parseInt(rows[0]?.total_count ?? '0');

    res.json({
      products: rows.map(({ total_count, ...p }) => p),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, category, brand, price_normal, price_promotion,
              image_url, stock, status, payment_method_ids, created_at
       FROM products WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Produto não encontrado' });
    const isAdmin = ['admin', 'superadmin'].includes(req.user?.role);
    if (rows[0].status === 'inactive' && !isAdmin) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, category, brand, price_normal, price_promotion, image_url, stock, status, payment_method_ids } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, category, brand, price_normal, price_promotion, image_url, stock, status, payment_method_ids)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, description, category, brand, price_normal, price_promotion, image_url, stock, status, payment_method_ids, created_at`,
      [name, description || null, category, brand || null, price_normal, price_promotion || null, image_url || null, stock, status || 'active',
       payment_method_ids?.length ? JSON.stringify(payment_method_ids) : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, category, brand, price_normal, price_promotion, image_url, stock, status, payment_method_ids } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET
         name = $1, description = $2, category = $3, brand = $4,
         price_normal = $5, price_promotion = $6, image_url = $7,
         stock = $8, status = $9, payment_method_ids = $10, updated_at = NOW()
       WHERE id = $11
       RETURNING id, name, description, category, brand, price_normal, price_promotion, image_url, stock, status, payment_method_ids, updated_at`,
      [name, description || null, category, brand || null, price_normal, price_promotion || null, image_url || null, stock, status,
       payment_method_ids?.length ? JSON.stringify(payment_method_ids) : null,
       req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    next(err);
  }
};
