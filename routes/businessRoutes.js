const express = require('express');
const businessController = require('../controllers/businessController');
const authController = require('../controllers/authController');
const uploadSinglePhoto = require('../util/multer/multerSinglePhoto');

const router = express.Router({ mergeParams: true });
const productsRouter = require('./productRoutes');

router.use('/:businessId/products', productsRouter);

router.use(authController.protect);

router.get('/', businessController.getAllBusinesses);

router.get('/:businessId', businessController.getBusiness);

router.use(authController.restrictTo('business'));

router.post('/', uploadSinglePhoto, businessController.createBusiness);
router.route('/:businessId').patch(uploadSinglePhoto, businessController.updateBusiness).delete(businessController.deleteBusiness);

module.exports = router;
