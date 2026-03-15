#!/usr/bin/env node
/**
 * Test Email Configuration
 * Run: node test_email_setup.js
 * Or: node test_email_setup.js send email@example.com
 */

require('dotenv').config();
const { testEmailConnection, sendVerificationEmail, sendPasswordResetEmail } = require('./utils/emailUtil');

(async () => {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check if environment variables are set
  console.log('📋 Configuration Check:');
  console.log(`✓ EMAIL_HOST: ${process.env.EMAIL_HOST ? '✅' : '❌'} (${process.env.EMAIL_HOST || 'NOT SET'})`);
  console.log(`✓ EMAIL_PORT: ${process.env.EMAIL_PORT ? '✅' : '❌'} (${process.env.EMAIL_PORT || 'NOT SET'})`);
  console.log(`✓ EMAIL_USER: ${process.env.EMAIL_USER ? '✅' : '❌'} (${process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/@.*/, '@***') : 'NOT SET'})`);
  console.log(`✓ EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅' : '❌'} (${process.env.EMAIL_PASSWORD ? '***' : 'NOT SET'})`);
  console.log(`✓ EMAIL_FROM: ${process.env.EMAIL_FROM ? '✅' : '❌'} (${process.env.EMAIL_FROM || 'NOT SET'})`);
  console.log(`✓ APP_URL: ${process.env.APP_URL ? '✅' : '❌'} (${process.env.APP_URL || 'NOT SET'})\n`);
  
  // Check if we should send a test email
  const args = process.argv.slice(2);
  
  if (args[0] === 'send' && args[1]) {
    // Send test email
    const testEmail = args[1];
    const testToken = 'test_token_' + Date.now();
    
    console.log(`📧 Sending Test Email to: ${testEmail}\n`);
    
    const result = await sendVerificationEmail(testEmail, testToken);
    
    if (result) {
      console.log('\n✅ Test email sent successfully!');
    } else {
      console.log('\n❌ Failed to send test email');
    }
    process.exit(result ? 0 : 1);
  }
  
  // Check if all required variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('\n❌ Email configuration incomplete!\n');
    console.log('📝 Setup Instructions:');
    console.log('1. Go to https://myaccount.google.com/apppasswords');
    console.log('2. Select "Mail" and "Windows Computer"');
    console.log('3. Copy the 16-character password (without spaces)');
    console.log('4. Update your .env file with:');
    console.log('   EMAIL_USER=your-gmail@gmail.com');
    console.log('   EMAIL_PASSWORD=your-16-char-password');
    console.log('5. Run this test again\n');
    process.exit(1);
  }
  
  // Test connection
  console.log('🔗 Testing SMTP Connection...');
  const connected = await testEmailConnection();
  
  if (connected) {
    console.log('\n✅ Email service is ready!');
    console.log('\n📧 To send a test email:');
    console.log('   node test_email_setup.js send your-email@gmail.com\n');
  } else {
    console.log('\n❌ Email connection failed!');
    console.log('\n⚠️ Troubleshooting:');
    console.log('1. Make sure 2-Step Verification is enabled: https://myaccount.google.com/security');
    console.log('2. Generate a new App Password at https://myaccount.google.com/apppasswords');
    console.log('3. Use the exact 16-character password (no spaces)');
    console.log('4. Update .env and try again\n');
    process.exit(1);
  }
})();
