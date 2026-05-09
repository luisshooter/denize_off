const pool = require('../config/db');

const PUBLIC_FIELDS = 'store_name, logo_url, banner_url, instagram_url, facebook_url, address, payment_methods, whatsapp_template_single, whatsapp_template_multiple, updated_at';

exports.getPublic = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM config WHERE id = 1`);
    res.json(rows[0] || {});
  } catch (err) {
    next(err);
  }
};

exports.getAdmin = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT store_name, whatsapp_number, default_message,
              logo_url, banner_url, instagram_url, facebook_url, address,
              payment_methods, whatsapp_template_single, whatsapp_template_multiple,
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
    const {
      store_name, whatsapp_number, default_message,
      logo_url, banner_url, instagram_url, facebook_url, address,
      payment_methods, whatsapp_template_single, whatsapp_template_multiple
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO config
         (id, store_name, whatsapp_number, default_message,
          logo_url, banner_url, instagram_url, facebook_url, address,
          payment_methods, whatsapp_template_single, whatsapp_template_multiple, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (id) DO UPDATE SET
         store_name                = EXCLUDED.store_name,
         whatsapp_number           = COALESCE(EXCLUDED.whatsapp_number, config.whatsapp_number),
         default_message           = EXCLUDED.default_message,
         logo_url                  = EXCLUDED.logo_url,
         banner_url                = EXCLUDED.banner_url,
         instagram_url             = EXCLUDED.instagram_url,
         facebook_url              = EXCLUDED.facebook_url,
         address                   = EXCLUDED.address,
         payment_methods           = EXCLUDED.payment_methods,
         whatsapp_template_single  = EXCLUDED.whatsapp_template_single,
         whatsapp_template_multiple= EXCLUDED.whatsapp_template_multiple,
         updated_at                = NOW()
       RETURNING ${PUBLIC_FIELDS}`,
      [
        store_name,
        whatsapp_number || null,
        default_message,
        logo_url || null,
        banner_url || null,
        instagram_url || null,
        facebook_url || null,
        address || null,
        payment_methods ? JSON.stringify(payment_methods) : '[]',
        whatsapp_template_single || null,
        whatsapp_template_multiple || null
      ]
    );
    res.json(rows[0]);
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
