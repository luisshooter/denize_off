const pool = require('../config/db');

exports.create = async (req, res, next) => {
  try {
    const { customer_name, customer_phone, items } = req.body;

    const productIds = [...new Set(items.map(i => i.product_id))];
    const { rows: products } = await pool.query(
      `SELECT id, name, price_normal, price_promotion, stock, status
       FROM products WHERE id = ANY($1::uuid[])`,
      [productIds]
    );

    const productMap = new Map(products.map(p => [p.id, p]));
    const enrichedItems = [];
    let total = 0;

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Produto não encontrado` });
      }
      if (product.status !== 'active') {
        return res.status(400).json({ error: `Produto indisponível: ${product.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente: ${product.name}` });
      }
      const price = parseFloat(product.price_promotion || product.price_normal);
      enrichedItems.push({ product_id: item.product_id, name: product.name, price, quantity: item.quantity });
      total += price * item.quantity;
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (customer_name, customer_phone, items, total)
       VALUES ($1, $2, $3, $4)
       RETURNING id, customer_name, customer_phone, items, total, status, created_at`,
      [customer_name, customer_phone, JSON.stringify(enrichedItems), parseFloat(total.toFixed(2))]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
    const conditions = [];
    const params = [];

    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      params.push(req.query.status);
      conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countParams = [...params];
    params.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT id, customer_name, customer_phone, items, total, status, notes, created_at
       FROM orders ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM orders ${where}`,
      countParams
    );

    res.json({
      orders: rows,
      pagination: {
        total: parseInt(countRows[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(countRows[0].count) / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, customer_name, total, status, updated_at`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
