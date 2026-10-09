const { query } = require('../config/postgres');

/**
 * Brevo / Transactional Email Delivery Webhook Handler
 */
exports.handleBrevoWebhook = async (req, res) => {
  try {
    const secretHeader = req.headers['x-brevo-webhook-secret'] || req.query.secret;
    const expectedSecret = process.env.WEBHOOK_SECRET || 'looop_webhook_secret_key_prod_2026';

    // Verify webhook signature/secret
    if (secretHeader !== expectedSecret) {
      console.warn('[Webhook Unauthorized] Invalid webhook secret provided.');
      return res.status(401).json({ success: false, message: 'Unauthorized webhook request.' });
    }

    const events = Array.isArray(req.body) ? req.body : [req.body];
    let processedCount = 0;

    for (const evt of events) {
      const eventName = (evt.event || '').toLowerCase();
      const messageId = evt['message-id'] || evt.messageId || evt.message_id;

      if (!messageId) continue;

      let newStatus = null;
      let timestampField = null;

      if (eventName === 'delivered') {
        newStatus = 'DELIVERED';
        timestampField = 'delivered_at';
      } else if (eventName.includes('bounce') || eventName === 'blocked') {
        newStatus = 'BOUNCED';
      } else if (eventName.includes('spam') || eventName.includes('complaint')) {
        newStatus = 'COMPLAINED';
      }

      if (newStatus) {
        try {
          let sql = `UPDATE email_outbox SET status = $1, updated_at = CURRENT_TIMESTAMP`;
          const params = [newStatus];
          let paramIdx = 2;

          if (timestampField === 'delivered_at') {
            sql += `, delivered_at = CURRENT_TIMESTAMP`;
          }

          sql += ` WHERE provider_message_id = $${paramIdx}`;
          params.push(messageId);

          const updateRes = await query(sql, params);
          if (updateRes.rowCount > 0) {
            processedCount++;
            console.log(`[Webhook Update] MessageID ${messageId} updated to ${newStatus}`);
          }
        } catch (dbErr) {
          console.error(`[Webhook DB Error] MessageID ${messageId}:`, dbErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook events processed successfully.',
      processed: processedCount
    });
  } catch (error) {
    console.error('Brevo webhook handler exception:', error);
    return res.status(500).json({ success: false, message: 'Failed to process email webhook.' });
  }
};
