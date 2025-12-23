const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const User = require('../models/User');

// Create transporter using basic username/password auth
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Function to send email (supports optional HTML)
const sendEmail = async (to, subject, text, html) => {
  const transporter = await createTransporter();

  // Verify transporter before sending (helps catch auth issues early)
  try {
    await transporter.verify();
  } catch (err) {
    console.error('Transporter verification failed:', err);
    throw err; // surface error to caller
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
  };

  if (html) mailOptions.html = html;
  if (text && !html) mailOptions.text = text; // prefer html when provided

  // Send and rethrow any errors so callers (like test scripts) can detect failures
  await transporter.sendMail(mailOptions);
};

// Verify transporter (useful for diagnostics)
const verifyTransporter = async () => {
  const transporter = createTransporter();
  await transporter.verify();
  return { authType: 'Basic' };
};

// Function to send task reminders (one email per user, include tasks without due dates)
const sendTaskReminders = async () => {
  try {
    // Find all pending (not completed) tasks, regardless of due date
    const tasks = await Task.find({ completed: false }).populate('userId');

    // Group tasks by user
    const tasksByUser = tasks.reduce((map, task) => {
      const user = task.userId;
      if (!user || !user._id) return map; // skip tasks without user
      const key = String(user._id);
      if (!map[key]) map[key] = { user, tasks: [] };
      map[key].tasks.push(task);
      return map;
    }, {});

    // Send one email per user listing all their pending tasks
    for (const key of Object.keys(tasksByUser)) {
      const { user, tasks: userTasks } = tasksByUser[key];
      if (!user.email) continue; // skip users without email

      const subject = `Task Reminder: You have ${userTasks.length} pending task${userTasks.length > 1 ? 's' : ''}`;

      const lines = userTasks.map((t) => {
        const due = t.dueDate ? ` (due: ${t.dueDate.toDateString()})` : ' (no due date)';
        return `- ${t.title}${due}`;
      });

      const text = `Hello ${user.name || ''},\n\nYou have the following pending task${userTasks.length > 1 ? 's' : ''}:\n\n${lines.join('\n')}\n\nPlease complete them when you can.`;

      const htmlLines = userTasks.map((t) => {
        const due = t.dueDate ? ` <em>(due: ${t.dueDate.toDateString()})</em>` : ' <em>(no due date)</em>';
        return `<li><strong>${escapeHtml(t.title)}</strong>${due}</li>`;
      });

      const html = `<!doctype html>
<html>
  <body>
    <p>Hello ${escapeHtml(user.name || '')},</p>
    <p>You have the following pending task${userTasks.length > 1 ? 's' : ''}:</p>
    <ul>
      ${htmlLines.join('\n      ')}
    </ul>
    <p>Please complete them when you can.</p>
  </body>
</html>`;

      try {
        await sendEmail(user.email, subject, text, html);
        console.log(`Sent reminder to ${user.email} (${userTasks.length} tasks)`);
      } catch (err) {
        console.error(`Failed to send reminder to ${user.email}:`, err);
      }
    }
  } catch (error) {
    console.error('Error sending task reminders:', error);
  }
};

// Escape helper for simple HTML sanitization
const escapeHtml = (str) => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

module.exports = { sendEmail, sendTaskReminders, verifyTransporter };