const nodemailer = require('nodemailer');
const axios = require('axios');

// ─── Development: Ethereal SMTP ───────────────────────────────────────────────
async function getDevTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('📧 Dev mode: using Ethereal test email');
    return transporter;
  } catch (err) {
    console.log('⚠️  Dev mode: email disabled (console only):', err.message);
    return null;
  }
}

// ─── Production: Brevo HTTP API (works on Render — no SMTP ports needed) ─────
async function sendViaBrevo({ from, fromName, to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY environment variable is not set');

  const response = await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: fromName || 'CampusFind', email: from },
      to: [{ email: to }],
      subject,
      htmlContent: html
    },
    {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

// ─── Shared send helper ───────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'foodylover65@gmail.com';
  const fromName  = process.env.EMAIL_FROM_NAME    || 'CampusFind';

  if (process.env.NODE_ENV !== 'production') {
    const transporter = await getDevTransporter();
    if (!transporter) return null;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to, subject, html
    });
    if (info.messageUrl) console.log('📬 Ethereal preview:', info.messageUrl);
    return info;
  }

  return sendViaBrevo({ from: fromEmail, fromName, to, subject, html });
}

// ─── Public API ───────────────────────────────────────────────────────────────

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationLink = `${process.env.APP_URL}/verify-email.html?token=${token}`;

    const info = await sendEmail({
      to: email,
      subject: '🎓 Verify Your CampusFind Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to CampusFind! 🎓</h2>
          <p>Hi there,</p>
          <p>Thank you for registering. Click the button below to verify your email:</p>
          <p style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">Or copy this link:<br/><code>${verificationLink}</code></p>
          <p style="color: #666; margin-top: 30px;">If you didn't create this account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2026 CampusFind. All rights reserved.</p>
        </div>
      `
    });

    if (!info) {
      console.log(`\n📧 [DEV - VERIFICATION LINK] ${verificationLink}\n`);
    } else {
      console.log('✅ Verification email sent to:', email);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    return false;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetLink = `${process.env.APP_URL}/reset-password.html?token=${token}`;

    const info = await sendEmail({
      to: email,
      subject: '🔑 Reset Your CampusFind Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request 🔑</h2>
          <p>Hi there,</p>
          <p>Click the button below to create a new password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">Or copy this link:<br/><code>${resetLink}</code></p>
          <p style="color: #d32f2f; margin-top: 20px; font-weight: bold;">⏰ This link will expire in 1 hour.</p>
          <p style="color: #666; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2026 CampusFind. All rights reserved.</p>
        </div>
      `
    });

    if (!info) {
      console.log(`\n🔑 [DEV - RESET LINK] ${resetLink}\n`);
    } else {
      console.log('✅ Password reset email sent to:', email);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return false;
  }
};

const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`📧 Sending OTP email to: ${email}`);

    const info = await sendEmail({
      to: email,
      subject: '🔐 Your CampusFind Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Code 🔐</h2>
          <p>Hi there,</p>
          <p>Your one-time password (OTP) for resetting your CampusFind password is:</p>
          <p style="margin: 30px 0; text-align: center;">
            <code style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; font-size: 32px; letter-spacing: 8px; font-weight: bold;">
              ${otp}
            </code>
          </p>
          <p style="color: #d32f2f; margin-top: 20px; font-weight: bold;">⏰ This code will expire in 10 minutes.</p>
          <p style="color: #666; margin-top: 30px;"><strong>Do not share this code with anyone.</strong></p>
          <p style="color: #666;">If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2026 CampusFind. All rights reserved.</p>
        </div>
      `
    });

    if (!info) {
      console.log(`\n🔐 [DEV MODE - OTP CODE] ${otp}\n`);
    } else {
      console.log('✅ OTP email sent successfully to:', email);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    if (error.message.includes('BREVO_API_KEY')) {
      console.error('⚠️  Set BREVO_API_KEY in your Render environment variables');
      console.error('   Get your key at: https://app.brevo.com/settings/keys/api');
    }
    return false;
  }
};

const testEmailConnection = async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️  Email service in development mode (console logging only)');
    return true;
  }
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not set');
    return false;
  }
  console.log('✅ Brevo API key is configured');
  return true;
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  testEmailConnection
};
