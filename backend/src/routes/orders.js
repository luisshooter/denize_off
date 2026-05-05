const router = require('express').Router();
const ordersController = require('../controllers/ordersController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.post('/', validate(schemas.order), ordersController.create);
router.get('/', authenticate, requireAdmin, ordersController.getAll);
router.put('/:id/status', authenticate, requireAdmin, validate(schemas.orderStatus), ordersController.updateStatus);

module.exports = router;
