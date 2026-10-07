/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Easily connect by setting BREVO_API_KEY in server/.env
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'looop.support@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'LOOOP Community';

/**
 * Send Transactional OTP Email via Brevo REST API
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6-digit verification code
 * @param {string} recipientName - Optional recipient name
 */
async function sendOtpEmail(toEmail, otpCode, recipientName = 'LOOOP Member') {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'looop.support@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'looop';

  // If Brevo API key is not configured, simulate dispatch safely
  if (!apiKey || apiKey.includes('your_brevo')) {
    console.log(`[Brevo Email Service - Ready for API Key]`);
    console.log(`📨 Simulation to: ${toEmail}`);
    console.log(`🔑 Verification Code: ${otpCode}`);
    return {
      success: true,
      simulated: true,
      message: 'OTP dispatched (simulated until BREVO_API_KEY is connected)',
      otpCode
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
      subject: `Your LOOOP Verification Code: ${otpCode}`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #065f46; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">LOOOP</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Circular Goods Sharing Community</p>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Your One-Time Login Code</p>
            <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #047857; margin: 0;">${otpCode}</div>
            <p style="color: #64748b; font-size: 12px; margin: 12px 0 0 0;">Valid for 5 minutes. Do not share this code with anyone.</p>
          </div>
          <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0;">
            If you did not request this login code, you can safely ignore this email.
          </p>
        </div>
      `
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

module.exports = {
  sendOtpEmail
};
