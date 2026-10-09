const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Brevo / Transactional Email Provider Webhook endpoint
router.post('/brevo', webhookController.handleBrevoWebhook);
router.post('/email', webhookController.handleBrevoWebhook);

module.exports = router;
