const EmailProvider = require('./EmailProvider');

/**
 * Mock Email Provider for automated tests and isolated development.
 * Never sends real emails to external servers.
 */
class MockProvider extends EmailProvider {
  constructor() {
    super('MockProvider');
    this.sentEmails = [];
    this.simulatedStatusState = 'READY';
    this.shouldFail = false;
    this.failureErrorCode = 'MOCK_TEMPORARY_ERROR';
    this.failureErrorMessage = 'Mock failure simulation';
  }

  setSimulatedStatusState(state) {
    this.simulatedStatusState = state;
  }

  setShouldFail(fail, code = 'MOCK_TEMPORARY_ERROR', message = 'Mock failure simulation') {
    this.shouldFail = fail;
    this.failureErrorCode = code;
    this.failureErrorMessage = message;
  }

  clearSentEmails() {
    this.sentEmails = [];
  }

  async getProviderHealth() {
    const isReady = this.simulatedStatusState === 'READY';
    return {
      statusState: this.simulatedStatusState,
      isReady,
      details: `Mock provider health state is ${this.simulatedStatusState}`
    };
  }

  async sendTransactionalEmail({ toEmail, recipientName = 'LOOOP Member', subject, htmlContent, textContent, templateKey }) {
    if (this.simulatedStatusState !== 'READY') {
      return {
        success: false,
        errorCode: this.simulatedStatusState,
        errorMessage: `Mock provider in ${this.simulatedStatusState} state`,
        statusState: this.simulatedStatusState
      };
    }

    if (this.shouldFail) {
      return {
        success: false,
        errorCode: this.failureErrorCode,
        errorMessage: this.failureErrorMessage,
        statusState: 'TEMPORARY_FAILURE'
      };
    }

    const messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record = {
      messageId,
      toEmail,
      recipientName,
      subject,
      templateKey,
      sentAt: new Date()
    };

    this.sentEmails.push(record);

    return {
      success: true,
      messageId,
      statusState: 'ACCEPTED_BY_PROVIDER'
    };
  }
}

module.exports = MockProvider;
