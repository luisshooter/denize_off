const Joi = require('joi');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map(d => d.message.replace(/"/g, "'"));
    return res.status(400).json({ error: 'Dados inválidos', details });
  }
  req[source] = value;
  next();
};

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];

const schemas = {
  login: Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(6).max(100).required()
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required()
  }),

  product: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(2000).allow('', null).optional(),
    category: Joi.string().min(1).max(100).lowercase().required(),
    brand: Joi.string().min(1).max(100).allow('', null).optional(),
    price_normal: Joi.number().positive().precision(2).required(),
    price_promotion: Joi.number().positive().precision(2).allow(null).optional(),
    image_url: Joi.string().max(2000000).allow('', null).optional(),
    stock: Joi.number().integer().min(0).max(99999).required(),
    status: Joi.string().valid('active', 'inactive').default('active'),
    gender: Joi.string().valid('feminino', 'masculino', 'misto').default('feminino'),
    payment_method_ids: Joi.array().items(Joi.string().max(50)).allow(null).optional()
  }),

  order: Joi.object({
    customer_name: Joi.string().min(2).max(255).required(),
    customer_phone: Joi.string().pattern(/^\+?[1-9]\d{7,14}$/).required(),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).max(999).required()
      })
    ).min(1).max(50).required()
  }),

  orderStatus: Joi.object({
    status: Joi.string().valid(...ORDER_STATUSES).required()
  }),

  config: Joi.object({
    store_name: Joi.string().min(2).max(255).optional(),
    whatsapp_number: Joi.string().pattern(/^\d{10,15}$/).allow('', null).optional(),
    default_message: Joi.string().max(500).allow('', null).optional(),
    logo_url: Joi.string().max(2000000).allow('', null).optional(),
    banner_url: Joi.string().max(2000000).allow('', null).optional(),
    instagram_url: Joi.string().uri().max(500).allow('', null).optional(),
    facebook_url: Joi.string().uri().max(500).allow('', null).optional(),
    address: Joi.string().max(500).allow('', null).optional(),
    whatsapp_template_single: Joi.string().max(2000).allow('', null).optional(),
    whatsapp_template_multiple: Joi.string().max(2000).allow('', null).optional(),
    categories: Joi.array()
      .items(Joi.string().min(1).max(100).lowercase())
      .min(1).max(50)
      .optional(),
    payment_methods: Joi.array().items(
      Joi.object({
        id: Joi.string().max(50).required(),
        type: Joi.string().valid('pix', 'credit_card', 'debit_card', 'cash', 'other').required(),
        label: Joi.string().max(100).required(),
        enabled: Joi.boolean().default(true),
        installments: Joi.number().integer().min(1).max(48).optional(),
        min_installment: Joi.number().positive().precision(2).optional()
      })
    ).optional()
  })
};

module.exports = { validate, schemas };
