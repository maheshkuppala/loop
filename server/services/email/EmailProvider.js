/**
 * Base EmailProvider Interface
 * Abstracts transactional email providers (Brevo, Mock, etc.)
 */
class EmailProvider {
  constructor(name = 'AbstractProvider') {
    this.name = name;
  }

  /**
   * Send a transactional email payload
   * @param {Object} options
   * @param {string} options.toEmail
   * @param {string} [options.recipientName]
   * @param {string} options.subject
   * @param {string} options.htmlContent
   * @param {string} [options.textContent]
   * @param {string} [options.templateKey]
   * @returns {Promise<{ success: boolean, messageId?: string, errorCode?: string, errorMessage?: string, statusState?: string }>}
   */
  async sendTransactionalEmail(options) {
    throw new Error('sendTransactionalEmail must be implemented by subclass');
  }

  /**
   * Get provider health and authorization status
   * @returns {Promise<{ statusState: string, isReady: boolean, details: string, error?: string }>}
   */
  async getProviderHealth() {
    throw new Error('getProviderHealth must be implemented by subclass');
  }
}

module.exports = EmailProvider;
