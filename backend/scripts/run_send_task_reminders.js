require('dotenv').config();
const mongoose = require('mongoose');
const { sendTaskReminders } = require('../services/emailService');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected — running reminders');

    await sendTaskReminders();

    await mongoose.disconnect();
    console.log('sendTaskReminders completed');
    process.exit(0);
  } catch (err) {
    console.error('sendTaskReminders failed:', err);
    process.exit(1);
  }
})();
