const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const tokenVerification = require('../util/verification/tokenVerification');
const uploadSinglePhoto = require('../util/multer/multerSinglePhoto');

const router = express.Router();
const businessRouter = require('./businessRoutes');

router.use('/:userId/business', businessRouter);

router.post('/signup', authController.signup(tokenVerification));
router.post('/email/confirm', authController.emailConfirm(tokenVerification));
router.post('/email/resend', authController.resendEmailConfirmationToken(tokenVerification));

router.post('/login', authController.login(tokenVerification));
router.post('/login/confirm', authController.twoFaConfirm(tokenVerification));

router.post('/password/reset', authController.forgotPassword);
router.patch('/password/reset/:token', authController.resetPassword);

router.get('/logout', authController.logout);

router.use(authController.protect);

router.post('/logout', authController.logout);

router.patch('/updatePassword', authController.updatePassword);

router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(uploadSinglePhoto, userController.resizeUserPhoto, userController.updateMe)
  .delete(userController.deleteMe);

module.exports = router;
