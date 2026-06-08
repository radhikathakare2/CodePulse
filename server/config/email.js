const nodemailer = require('nodemailer');

/**
 * Create and configure the Nodemailer transporter.
 * Uses Gmail SMTP by default; swap with any SMTP provider via env vars.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false, // TLS via STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

// Verify connection on startup (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️  Email transporter not ready:', error.message);
  } else {
    console.log('✅ Email transporter ready');
  }
});

module.exports = transporter;
