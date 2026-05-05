const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));
router.use('/config', require('./config'));

module.exports = router;
