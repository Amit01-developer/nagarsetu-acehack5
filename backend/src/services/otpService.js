const crypto = require('crypto');

const getEmailOtpConfig = () => {
  return {
    ttlMinutes: parseInt(process.env.EMAIL_OTP_TTL_MINUTES || '10', 10),
    resendCooldownSeconds: parseInt(process.env.EMAIL_OTP_RESEND_COOLDOWN_SECONDS || '60', 10),
    maxAttempts: parseInt(process.env.EMAIL_OTP_MAX_ATTEMPTS || '5', 10),
    hashSecret: process.env.EMAIL_OTP_HASH_SECRET || '',
  };
};

const generateNumericOtp = () => {
  return crypto.randomInt(100000, 1000000).toString(); // 6 digits
};

const hashOtp = (otp, email, secret = '') => {
  return crypto
    .createHash('sha256')
    .update(`${otp}:${email.toLowerCase()}:${secret}`)
    .digest('hex');
};

module.exports = {
  getEmailOtpConfig,
  generateNumericOtp,
  hashOtp,
};

