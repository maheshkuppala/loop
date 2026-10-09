/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Easily connect by setting BREVO_API_KEY in server/.env
 */

const { buildLooopEmailHtml, looopEmailTemplates } = require('./emailTemplateService');

const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'looop.support@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'LOOOP Community';

/**
 * Send Transactional Email via Brevo API using LOOOP Email Templates
 */
async function sendLooopEmail({ toEmail, recipientName = 'LOOOP Member', templateType = 'otpEmail', templateParams = {} }) {
  const apiKey = process.env.BREVO_API_KEY;

  let emailContent = null;
  if (looopEmailTemplates[templateType]) {
    emailContent = looopEmailTemplates[templateType]({ name: recipientName, ...templateParams });
  } else {
    emailContent = {
      subject: templateParams.subject || 'LOOOP Notification',
      html: buildLooopEmailHtml({
        headline: templateParams.headline || 'Notification',
        recipientName,
        bodyParagraphs: templateParams.bodyParagraphs || [],
        cardTitle: templateParams.cardTitle,
        cardRows: templateParams.cardRows,
        buttonText: templateParams.buttonText,
        buttonUrl: templateParams.buttonUrl,
        extraNote: templateParams.extraNote
      })
    };
  }

  // If Brevo API key is not configured, simulate dispatch safely
  if (!apiKey || apiKey.includes('your_brevo')) {
    console.log(`[Brevo Email Service - Ready for API Key]`);
    console.log(`📨 Simulation to: ${toEmail} (${recipientName})`);
    console.log(`📋 Template: ${templateType}`);
    console.log(`📌 Subject: ${emailContent.subject}`);
    return {
      success: true,
      simulated: true,
      message: 'Email dispatched (simulated until BREVO_API_KEY is connected)',
      subject: emailContent.subject
    };
  }

  // Real Brevo v3 Transactional Email Dispatch
  try {
    const payload = {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL
      },
      to: [
        {
          email: toEmail,
          name: recipientName
        }
      ],
      subject: emailContent.subject,
      htmlContent: emailContent.html
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Brevo API Error]', errText);
      return { success: false, error: errText };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error('[Brevo Service Exception]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send Transactional OTP Email via Brevo REST API
 */
async function sendOtpEmail(toEmail, otpCode, recipientName = 'LOOOP Member') {
  return sendLooopEmail({
    toEmail,
    recipientName,
    templateType: 'otpEmail',
    templateParams: { otpCode, expiry: '10 minutes' }
  });
}

module.exports = {
  sendLooopEmail,
  sendOtpEmail
};
