const nodemailer = require('nodemailer');

// Create email transporter
let transporter = null;

// Initialize transporter only in production or when credentials are available
async function getTransporter() {
  if (transporter) return transporter;
  
  if (process.env.NODE_ENV !== 'production') {
    // Development mode - create a test account or use console logging
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        logger: false,
        debug: false
      });
      console.log('📧 Development mode: Using Ethereal test email service');
      return transporter;
    } catch (err) {
      console.log('⚠️  Development mode: Email sending disabled (console logging only)\nReason:', err.message);
      return null;
    }
  }
  
  // Production mode - use Gmail SMTP
  try {
    console.log('📧 Initializing Gmail SMTP transporter...');
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
    
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // Use TLS, not SSL
      requireTLS: true, // Force TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      logger: true,
      debug: process.env.DEBUG_EMAIL === 'true',
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates on Render
      },
      connection: {
        family: 4 // Force IPv4 (disable IPv6 to avoid ENETUNREACH errors on Render)
      }
    });
    
    console.log('✅ Gmail SMTP transporter initialized successfully');
    return transporter;
  } catch (err) {
    console.error('❌ Failed to initialize production email transporter:', err.message);
    return null;
  }
}

/**
 * Send verification email to new student
 * @param {string} email - Recipient email address
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (email, token) => {
  try {
    const verificationLink = `${process.env.APP_URL}/verify-email.html?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CampusFind <noreply@campusfind.com>',
      to: email,
      subject: '🎓 Verify Your CampusFind Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to CampusFind! 🎓</h2>
          <p>Hi there,</p>
          <p>Thank you for registering with CampusFind. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <p style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </p>
          
          <p style="color: #666; font-size: 12px;">
            Or copy this link: <br/>
            <code>${verificationLink}</code>
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            If you didn't create this account, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 CampusFind. All rights reserved.
          </p>
        </div>
      `
    };

    const transporter = await getTransporter();
    
    if (!transporter) {
      // Development mode with no SMTP configured - log to console
      console.log('\n📧 [EMAIL - VERIFICATION]');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Verification Link: ${verificationLink}\n`);
      return true;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.response);
    if (process.env.NODE_ENV !== 'production' && info.messageUrl) {
      console.log('📬 Preview:', info.messageUrl);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    return false;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} token - Reset token
 */
const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetLink = `${process.env.APP_URL}/reset-password.html?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CampusFind <noreply@campusfind.com>',
      to: email,
      subject: '🔑 Reset Your CampusFind Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request 🔑</h2>
          <p>Hi there,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <p style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          
          <p style="color: #666; font-size: 12px;">
            Or copy this link: <br/>
            <code>${resetLink}</code>
          </p>
          
          <p style="color: #d32f2f; margin-top: 20px; font-weight: bold;">
            ⏰ This link will expire in 1 hour.
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            If you didn't request a password reset, please ignore this email or contact support if you need help.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 CampusFind. All rights reserved.
          </p>
        </div>
      `
    };

    const transporter = await getTransporter();
    
    if (!transporter) {
      // Development mode with no SMTP configured - log to console
      console.log('\n🔑 [EMAIL - PASSWORD RESET]');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Reset Link: ${resetLink}\n`);
      return true;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.response);
    if (process.env.NODE_ENV !== 'production' && info.messageUrl) {
      console.log('📬 Preview:', info.messageUrl);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return false;
  }
};

/**
 * Test email connection (verify configuration is correct)
 */
const testEmailConnection = async () => {
  try {    const transporter = await getTransporter();
    
    if (!transporter) {
      console.log('⚠️  Email service in development mode (console logging only)');
      return true;
    }
        await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email connection error:', error.message);
    console.error('\n⚠️ Setup Instructions:');
    console.error('1. Go to https://myaccount.google.com/apppasswords');
    console.error('2. Select "Mail" and "Windows Computer"');
    console.error('3. Copy the 16-character password');
    console.error('4. Update .env file with your Gmail and app password');
    return false;
  }
};

/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email address
 * @param {string} otp - One-time password code
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CampusFind <noreply@campusfind.com>',
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
          
          <p style="color: #d32f2f; margin-top: 20px; font-weight: bold;">
            ⏰ This code will expire in 10 minutes.
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            <strong>Do not share this code with anyone.</strong> CampusFind staff will never ask for your OTP.
          </p>
          
          <p style="color: #666;">
            If you didn't request a password reset, please ignore this email and your account will remain secure.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 CampusFind. All rights reserved.
          </p>
        </div>
      `
    };

    console.log(`📧 Sending OTP email to: ${email}`);
    const transporter = await getTransporter();
    
    if (!transporter) {
      // Development mode with no SMTP configured - log to console
      console.log('\n🔐 [EMAIL - OTP]');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`OTP Code: ${otp}\n`);
      return true;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully');
    console.log(`   Response: ${info.response}`);
    console.log(`   Message ID: ${info.messageId}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n🔐 [DEV MODE - OTP CODE] ${otp}`);
      if (info.messageUrl) {
        console.log('📬 Preview:', info.messageUrl);
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error details:', error);
    
    // Gmail-specific error handling
    if (error.code === 'EAUTH') {
      console.error('\n⚠️ GMAIL AUTHENTICATION ERROR - Check:');
      console.error('1. Gmail 2-Step Verification is enabled');
      console.error('2. App password created at https://myaccount.google.com/apppasswords');
      console.error('3. EMAIL_PASSWORD in .env is the 16-character app password (no spaces)');
      console.error('4. EMAIL_USER in .env is your Gmail address');
    }
    
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  testEmailConnection
};
