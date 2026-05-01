const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Create a nodemailer transporter
 * @returns {Object} - Nodemailer transporter
 */
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.warn('Email configuration not found in environment variables. Password reset emails will not work.');
    return null;
  }

  // Create transporter
  // For Gmail, we need to use OAuth2 or an app password
  // For testing purposes, we can use Mailtrap or a test account from Ethereal
  if (process.env.EMAIL_SERVICE.toLowerCase() === 'gmail') {
    console.log('Using Gmail service with app password');
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD // This should be an app password, not your regular password
      },
      debug: true // Enable debug output
    });
  } else if (process.env.EMAIL_SERVICE.toLowerCase() === 'mailtrap') {
    console.log('Using Mailtrap for email testing');
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true // Enable debug output
    });
  } else {
    // For other services
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<boolean>} - True if email sent successfully, false otherwise
 */
const sendPasswordResetEmail = async (to, resetToken) => {
  try {
    console.log('Attempting to send password reset email to:', to);
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('Email transporter could not be created. Check email configuration.');
      return false;
    }

    console.log('Email configuration found:', {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USERNAME,
      frontendUrl: process.env.FRONTEND_URL
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('Reset URL generated:', resetUrl);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
      to,
      subject: 'Password Reset - ShareGoods',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Reset Your Password</h2>
          <p>You requested a password reset for your ShareGoods account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #718096;">ShareGoods - Connecting donors with those in need</p>
        </div>
      `
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    
    // For Mailtrap, log the message URL for easy access to the test inbox
    if (process.env.EMAIL_SERVICE.toLowerCase() === 'mailtrap') {
      console.log('Mailtrap message ID:', info.messageId);
      console.log('Check your Mailtrap inbox to view the email: https://mailtrap.io/inboxes');
    }
    
    // Only log preview URL if it's available (for ethereal email)
    if (info && typeof nodemailer.getTestMessageUrl === 'function') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication error. Check your email credentials and app password settings.');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error. Check your Mailtrap host and port settings.');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection error. Check your network connection and Mailtrap service status.');
    }
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail
};