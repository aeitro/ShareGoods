/**
 * Placeholder for OTP and Email verification services
 */

/**
 * Send OTP to a phone number
 */
exports.sendOTP = async (phone) => {
  console.log(`[STUB] Sending OTP to ${phone}... (Service: Placeholder)`);
  // In real implementation:
  // const response = await twilio.messages.create({ body: 'Your code: 1234', from: '+1234', to: phone });
  return { status: 'success', message: 'OTP sent' };
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (phone, code) => {
  console.log(`[STUB] Verifying OTP ${code} for ${phone}...`);
  return code === '123456'; // Placeholder logic
};

/**
 * Send email verification link
 */
exports.sendEmailVerification = async (email, link) => {
  console.log(`[STUB] Sending verification link to ${email}: ${link}`);
  // In real implementation:
  // await resend.emails.send({ from: 'ShareGoods <onboarding@resend.dev>', to: email, subject: 'Verify your email', html: `<a href="${link}">Verify</a>` });
  return { status: 'success', message: 'Email sent' };
};

/**
 * Generate Cloudinary Signed Upload Signature
 */
exports.getCloudinarySignature = (params) => {
  console.log(`[STUB] Generating Cloudinary signature for params:`, params);
  // In real implementation:
  // return cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  return 'placeholder_signature_12345';
};
