const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

router.use(authController.restrictTo('business'));

router.post('/', productController.createProduct);
router.route('/:id').patch(productController.updateProduct).delete(productController.deleteProduct);

module.exports = router;
