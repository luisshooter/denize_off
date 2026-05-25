const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.error('[Error]', err.message, err.stack?.split('\n')[1]);

  if (err.message?.includes('CORS')) return res.status(403).json({ error: err.message });
  if (err.code === '23505') return res.status(409).json({ error: 'Registro já existe' });
  if (err.code === '23503') return res.status(400).json({ error: 'Referência inválida' });
  if (err.code === '22P02') return res.status(400).json({ error: 'ID inválido' });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message
  });
};

module.exports = errorHandler;
