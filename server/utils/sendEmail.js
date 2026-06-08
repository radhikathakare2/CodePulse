const transporter = require('../config/email');

/**
 * Shared CodePulse HTML email header/footer for branding consistency.
 */
const emailHeader = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CodePulse</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f1a; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
    .body { padding: 40px; }
    .body h2 { color: #a78bfa; margin-top: 0; }
    .body p { line-height: 1.7; color: #cbd5e1; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
    .code-box { background: #0f0f1a; border: 1px solid #334155; border-radius: 8px; padding: 16px 24px; font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center; color: #a78bfa; margin: 24px 0; }
    .footer { background: #0f0f1a; padding: 20px 40px; text-align: center; color: #475569; font-size: 12px; }
    .footer a { color: #6366f1; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #1e293b; margin: 24px 0; }
    .warning { background: #1e1b4b; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; color: #fbbf24; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>⚡ CodePulse</h1>
    <p>Competitive Programming Analytics Platform</p>
  </div>
`;

const emailFooter = `
  <div class="footer">
    <p>© ${new Date().getFullYear()} CodePulse. All rights reserved.</p>
    <p>You received this email because an account was created with this address.</p>
    <p><a href="${process.env.FRONTEND_URL}">Visit CodePulse</a></p>
  </div>
</div>
</body>
</html>
`;

/**
 * Send an email verification link to a new user.
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @param {string} name - User's display name
 */
const sendVerificationEmail = async (email, token, name) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `${emailHeader}
  <div class="body">
    <h2>Welcome to CodePulse, ${name}! 🎉</h2>
    <p>You're almost ready to start tracking your competitive programming journey. Please verify your email address to activate your account.</p>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="btn">✅ Verify Email Address</a>
    </div>
    <hr class="divider"/>
    <p>Or paste this link in your browser:</p>
    <p style="word-break: break-all; color: #6366f1;">${verifyUrl}</p>
    <div class="warning">⏳ This link expires in <strong>24 hours</strong>. If you didn't create this account, you can safely ignore this email.</div>
  </div>
  ${emailFooter}`;

  await transporter.sendMail({
    from: `"CodePulse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Verify Your CodePulse Account',
    html,
  });
};

/**
 * Send a password reset email with a reset link.
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 * @param {string} name - User's display name
 */
const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `${emailHeader}
  <div class="body">
    <h2>Password Reset Request 🔐</h2>
    <p>Hi <strong>${name}</strong>, we received a request to reset your CodePulse account password.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">🔑 Reset Password</a>
    </div>
    <hr class="divider"/>
    <p>Or paste this link in your browser:</p>
    <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
    <div class="warning">⏳ This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please contact support immediately.</div>
  </div>
  ${emailFooter}`;

  await transporter.sendMail({
    from: `"CodePulse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Your CodePulse Password',
    html,
  });
};

/**
 * Send a welcome email after successful email verification.
 * @param {string} email - Recipient email
 * @param {string} name - User's display name
 */
const sendWelcomeEmail = async (email, name) => {
  const html = `${emailHeader}
  <div class="body">
    <h2>You're In! Welcome to CodePulse 🚀</h2>
    <p>Hi <strong>${name}</strong>, your account is verified and ready to go!</p>
    <p>Here's what you can do with CodePulse:</p>
    <ul style="color: #cbd5e1; line-height: 2;">
      <li>⚡ Sync your LeetCode, Codeforces & GFG stats</li>
      <li>📊 Analyze your coding patterns with AI insights</li>
      <li>🏆 Compete on global leaderboards</li>
      <li>👥 Join study groups with friends</li>
      <li>🗓️ Get contest reminders across platforms</li>
    </ul>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">🚀 Go to Dashboard</a>
    </div>
    <hr class="divider"/>
    <p style="font-size: 13px; color: #64748b;">Upgrade to Premium to unlock AI-powered weak topic analysis, personalized roadmaps, and contest predictions.</p>
  </div>
  ${emailFooter}`;

  await transporter.sendMail({
    from: `"CodePulse" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🚀 Welcome to CodePulse - Your CP Journey Starts Now!',
    html,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail };
