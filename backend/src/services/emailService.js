let nodemailer = null;

try {
  // Optional dependency: install with `npm i nodemailer` in backend workspace.
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

const hasSmtpConfig = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM
  );
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!nodemailer || !hasSmtpConfig()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[emailService] Email not sent (SMTP not configured).', { to, subject, text });
      return { sent: false, reason: 'not_configured' };
    }
    throw new Error('SMTP is not configured (set SMTP_* and EMAIL_FROM).');
  }

  const port = parseInt(process.env.SMTP_PORT, 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

module.exports = {
  sendEmail,
};

