const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const uploadSinglePhoto = require('../util/multer/multerSinglePhoto');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

router.use(authController.restrictTo('business'));

router.post('/', uploadSinglePhoto, productController.createProduct);
router.route('/:id').patch(uploadSinglePhoto, productController.updateProduct).delete(productController.deleteProduct);

module.exports = router;
