const pool = require('../config/db');

const DEFAULT_CATEGORIES = ['maquiagem','skincare','cabelo','corpo','perfumes','unhas','outros'];

const PUBLIC_FIELDS = 'store_name, logo_url, banner_url, instagram_url, facebook_url, address, payment_methods, categories, whatsapp_template_single, whatsapp_template_multiple, updated_at';

exports.getPublic = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM config WHERE id = 1`);
    const row = rows[0] || {};
    if (!Array.isArray(row.categories) || row.categories.length === 0) {
      row.categories = DEFAULT_CATEGORIES;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
};

exports.getAdmin = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT store_name, whatsapp_number, default_message,
              logo_url, banner_url, instagram_url, facebook_url, address,
              payment_methods, categories, whatsapp_template_single, whatsapp_template_multiple,
              updated_at
       FROM config WHERE id = 1`
    );
    res.json(rows[0] || {});
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const body = req.body;
    const sets = [];
    const params = [];
    let i = 1;

    const field = (col, val) => { sets.push(`${col} = $${i++}`); params.push(val); };

    if ('store_name'                 in body) field('store_name',                 body.store_name || null);
    if ('whatsapp_number'            in body) field('whatsapp_number',            body.whatsapp_number || null);
    if ('default_message'            in body) field('default_message',            body.default_message || null);
    if ('logo_url'                   in body) field('logo_url',                   body.logo_url || null);
    if ('banner_url'                 in body) field('banner_url',                 body.banner_url || null);
    if ('instagram_url'              in body) field('instagram_url',              body.instagram_url || null);
    if ('facebook_url'               in body) field('facebook_url',              body.facebook_url || null);
    if ('address'                    in body) field('address',                    body.address || null);
    if ('payment_methods'            in body) field('payment_methods',            JSON.stringify(body.payment_methods || []));
    if ('categories'                 in body && body.categories?.length > 0)
                                             field('categories',                  JSON.stringify(body.categories));
    if ('whatsapp_template_single'   in body) field('whatsapp_template_single',   body.whatsapp_template_single || null);
    if ('whatsapp_template_multiple' in body) field('whatsapp_template_multiple', body.whatsapp_template_multiple || null);

    if (sets.length === 0) {
      const { rows } = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM config WHERE id = 1`);
      return res.json(rows[0] || {});
    }

    sets.push('updated_at = NOW()');
    params.push(1); // WHERE id = $N

    const { rows } = await pool.query(
      `UPDATE config SET ${sets.join(', ')} WHERE id = $${i} RETURNING ${PUBLIC_FIELDS}`,
      params
    );
    res.json(rows[0] || {});
  } catch (err) {
    next(err);
  }
};

exports.getWhatsappLink = async (req, res, next) => {
  try {
    const { message } = req.query;
    const { rows } = await pool.query(
      'SELECT whatsapp_number, default_message FROM config WHERE id = 1'
    );
    const cfg = rows[0];
    if (!cfg?.whatsapp_number) {
      return res.status(503).json({ error: 'WhatsApp não configurado' });
    }
    const text = encodeURIComponent(
      typeof message === 'string' ? message.slice(0, 2000) : cfg.default_message
    );
    res.json({ link: `https://wa.me/${cfg.whatsapp_number}?text=${text}` });
  } catch (err) {
    next(err);
  }
};
