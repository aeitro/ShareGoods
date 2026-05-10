const { Resend } = require('resend');
const EmailService = require('./EmailService');

/**
 * ResendEmailService implementation
 * Uses the Resend SDK to deliver transactional emails.
 */
class ResendEmailService extends EmailService {
  constructor() {
    super();
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is missing. Email notifications will be disabled.');
    }
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_FROM || 'ShareGoods <onboarding@resend.dev>';
  }

  /**
   * Generic send method
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      if (!process.env.RESEND_API_KEY) return false;

      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text
      });

      if (error) {
        console.error('Resend Error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Unexpected Email Error:', error);
      return false;
    }
  }

  /**
   * Notification: Someone requested your item
   */
  async sendMatchRequestEmail(to, data) {
    const { donorName, recipientName, itemName } = data;
    return this.sendEmail({
      to,
      subject: '🎁 New Item Request on ShareGoods',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #4CAF50;">Hello ${donorName}!</h2>
          <p>Great news! <strong>${recipientName}</strong> is interested in your item: <strong>${itemName}</strong>.</p>
          <p>You can view the request and start a chat in your dashboard.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/donor" 
               style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
               View Request
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">ShareGoods - Sharing is Caring</p>
        </div>
      `
    });
  }

  /**
   * Notification: Donor accepted your request
   */
  async sendMatchConfirmedEmail(to, data) {
    const { recipientName, donorName, itemName } = data;
    return this.sendEmail({
      to,
      subject: '✅ Request Confirmed - ShareGoods',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2196F3;">Good news, ${recipientName}!</h2>
          <p><strong>${donorName}</strong> has confirmed your request for: <strong>${itemName}</strong>.</p>
          <p>You can now coordinate the handover via the chat.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/recipient" 
               style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
               Go to Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">ShareGoods - Connecting Communities</p>
        </div>
      `
    });
  }

  /**
   * Notification: Handover details updated
   */
  async sendHandoverScheduledEmail(to, data) {
    const { userName, itemName, time, location } = data;
    return this.sendEmail({
      to,
      subject: '📅 Handover Scheduled - ShareGoods',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Handover Update for ${itemName}</h2>
          <p>Hello ${userName}, a handover has been scheduled:</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Time:</strong> ${new Date(time).toLocaleString()}</p>
            <p><strong>Location:</strong> ${location}</p>
          </div>
          <p>Please be on time and stay safe!</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">ShareGoods - Safe and Trusted Sharing</p>
        </div>
      `
    });
  }
}

module.exports = ResendEmailService;
