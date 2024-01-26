const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/payment-sheet', paymentController.createPaymentSheet);

router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhookCheckout);

router.post('/create-charge', paymentController.createCharge);

module.exports = router;
