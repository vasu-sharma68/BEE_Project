require('dotenv').config();
const { sendEmail, verifyTransporter } = require('../services/emailService');

const recipient = process.argv[2] || process.env.EMAIL_USER;

(async () => {
  try {
    // Show which auth method will be used
    try {
      const info = await verifyTransporter();
      console.log('Transporter verified. Auth type:', info.authType);
    } catch (verifyErr) {
      console.error('Transporter verification failed:', verifyErr.message || verifyErr);
      // continue to attempt send so we can see send errors as well
    }

    await sendEmail(recipient, 'Test Email from Task Manager', 'This is a test email sent by an automated script. If you received this, email sending works.');
    console.log('Test email sent successfully to', recipient);
    process.exit(0);
  } catch (err) {
    console.error('Test email failed:', err);
    process.exit(1);
  }
})();
