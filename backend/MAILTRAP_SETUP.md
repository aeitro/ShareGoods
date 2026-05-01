# Setting Up Mailtrap for Email Testing

## Overview

This guide explains how to use Mailtrap to test the password reset functionality in the ShareGoods application without sending emails to real addresses.

## What is Mailtrap?

Mailtrap is a fake SMTP server for development teams to test, view and share emails sent from the development and staging environments without sending them to real customers.

## Setup Instructions

### 1. Create a Mailtrap Account

1. Go to [Mailtrap.io](https://mailtrap.io/) and sign up for a free account
2. After signing in, navigate to the Email Testing section
3. Create a new inbox or use the default one

### 2. Get Your SMTP Credentials

1. In your inbox, click on "SMTP Settings"
2. Select "Nodemailer" from the integrations dropdown
3. Copy the provided credentials

### 3. Update Your Environment Variables

Update the following variables in your `.env` file:

```
EMAIL_SERVICE=mailtrap
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM=noreply@sharegoods.com
```

Replace `your_mailtrap_username` and `your_mailtrap_password` with the credentials from Mailtrap.

## Testing the Password Reset

1. Start your application
2. Go to the login page and click "Forgot Password"
3. Enter any email address (it doesn't need to be real)
4. Submit the form
5. Check your Mailtrap inbox to see if the password reset email was received
6. You can view the email content, HTML structure, and spam score in Mailtrap

## Troubleshooting

### Email Not Showing in Mailtrap

1. Check the server logs for any errors
2. Verify that your Mailtrap credentials are correct in the `.env` file
3. Make sure the application is using the Mailtrap configuration (EMAIL_SERVICE=mailtrap)
4. Check if the password reset functionality is being triggered correctly

### Connection Errors

If you see connection errors in the logs:

1. Verify that your internet connection is working
2. Check if Mailtrap's service is up and running
3. Make sure your firewall isn't blocking outgoing SMTP connections

## Switching to Production

When you're ready to move to production, update your `.env` file to use your production email service:

```
EMAIL_SERVICE=your_production_service
EMAIL_USERNAME=your_production_username
EMAIL_PASSWORD=your_production_password
EMAIL_FROM=noreply@sharegoods.com
```

## Additional Resources

- [Mailtrap Documentation](https://mailtrap.io/blog/sending-emails-with-nodemailer/)
- [Nodemailer Documentation](https://nodemailer.com/about/)