const express = require('express');
const defaultIndexController = require('../controllers/defaultIndexController');

const router = express.Router();

router.get('/welcome', defaultIndexController.defaultRoute);

router.get('/email/confirm/:token', defaultIndexController.defaultRoute);

router.get('/password/reset/:token', defaultIndexController.defaultRoute);

router.get('/login/confirm/:token', defaultIndexController.defaultRoute);

module.exports = router;
