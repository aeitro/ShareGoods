/**
 * EmailService Interface (Abstract Class)
 * Defines the contract for all email provider implementations.
 */
class EmailService {
  /**
   * Send a generic email
   * @param {Object} options - Email options (to, subject, html, text)
   */
  async sendEmail(options) {
    throw new Error('Method sendEmail() must be implemented');
  }

  /**
   * Send a match request notification
   * @param {string} to - Recipient email
   * @param {Object} data - Template data (donorName, recipientName, itemName)
   */
  async sendMatchRequestEmail(to, data) {
    throw new Error('Method sendMatchRequestEmail() must be implemented');
  }

  /**
   * Send a match confirmation notification
   * @param {string} to - Recipient email
   * @param {Object} data - Template data (itemName, donorName)
   */
  async sendMatchConfirmedEmail(to, data) {
    throw new Error('Method sendMatchConfirmedEmail() must be implemented');
  }

  /**
   * Send a handover scheduled notification
   * @param {string} to - Recipient email
   * @param {Object} data - Template data (itemName, time, location)
   */
  async sendHandoverScheduledEmail(to, data) {
    throw new Error('Method sendHandoverScheduledEmail() must be implemented');
  }
}

module.exports = EmailService;
