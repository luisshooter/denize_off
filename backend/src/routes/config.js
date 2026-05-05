const router = require('express').Router();
const configController = require('../controllers/configController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.get('/', configController.getPublic);
router.get('/admin', authenticate, requireAdmin, configController.getAdmin);
router.put('/', authenticate, requireAdmin, validate(schemas.config), configController.update);
router.get('/whatsapp-link', configController.getWhatsappLink);

module.exports = router;
