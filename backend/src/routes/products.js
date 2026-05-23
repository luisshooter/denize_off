const router = require('express').Router();
const productsController = require('../controllers/productsController');
const { authenticate, requireAdmin, optionalAuthenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/', optionalAuthenticate, productsController.getAll);
router.get('/:id', optionalAuthenticate, productsController.getById);
router.post('/', authenticate, requireAdmin, validate(schemas.product), productsController.create);
router.put('/:id', authenticate, requireAdmin, validate(schemas.product), productsController.update);
router.delete('/:id', authenticate, requireAdmin, productsController.remove);

module.exports = router;
