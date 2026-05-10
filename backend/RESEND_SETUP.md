# Resend Email Setup Guide

ShareGoods uses **Resend** for production-grade transactional email notifications. Follow these steps to set up your account and enable email delivery.

## 1. Create a Resend Account
- Go to [resend.com](https://resend.com) and sign up for a free account.
- Complete the onboarding process.

## 2. Generate API Key
- Navigate to the **API Keys** tab in your Resend dashboard.
- Click **Create API Key**.
- Give it a name (e.g., `ShareGoods-Prod`).
- Copy the key immediately. You will need it for your `.env` file.

## 3. Verify Your Sender (Domain or Email)
Resend requires you to verify where the emails are coming from.
- **For Testing**: You can use the default `onboarding@resend.dev` address (limited to sending to your own signup email).
- **For Production**: 
    - Go to **Domains** in Resend.
    - Add your domain (e.g., `sharegoods.com`).
    - Update your DNS records with the provided MX/TXT values.
    - Once verified, you can send emails from any address at that domain (e.g., `hello@sharegoods.com`).

## 4. Configure Environment Variables
Update your `backend/authentication/.env` (or the root `.env` if shared) with the following:

```env
# Resend Configuration
RESEND_API_KEY=re_123456789...
EMAIL_FROM=ShareGoods <hello@yourdomain.com>
```

## 5. Notification Templates
The application currently supports the following automated email flows:
- **New Match Request**: Sent to donors when someone requests their item.
- **Request Confirmation**: Sent to recipients when a donor accepts their request.
- **Handover Scheduling**: Sent to both parties when pickup details are updated.

---

### Why Resend?
- **Modern API**: Much faster and more reliable than traditional SMTP (like Mailtrap/Nodemailer).
- **Better Deliverability**: Built-in support for DKIM, SPF, and DMARC.
- **Developer Friendly**: Clean JSON-based API and excellent SDK support.
