const express = require('express');
const authController = require('../controllers/authController');
const urlVerification = require('../util/verification/urlVerification');

const router = express.Router();

router.post('/signup', authController.signup(urlVerification));
router.post('/email/confirm/:token', authController.emailConfirm(urlVerification));
router.post('/email/resend', authController.resendEmailConfirmationToken(urlVerification));

router.post('/login', authController.login(urlVerification));
router.post('/login/confirm/:token', authController.twoFaConfirm(urlVerification));

module.exports = router;
