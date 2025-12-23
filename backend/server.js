require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { sendTaskReminders } = require('./services/emailService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Schedule task reminders only after DB connection is established
    cron.schedule('37 13 * * *', () => {
      console.log('Sending task reminders...');
      sendTaskReminders();
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/stats', require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Manual trigger for task reminders
app.get('/api/send-reminders', async (req, res) => {
  try {
    await sendTaskReminders();
    res.json({ message: 'Task reminders sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from your frontend
    methods: ["GET", "POST"]
  }
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('joinFolder', (folderId) => {
    socket.join(folderId);
    console.log(`User joined folder: ${folderId}`);
  });
  socket.on('leaveFolder', (folderId) => {
    socket.leave(folderId);
    console.log(`User left folder: ${folderId}`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Export io for controllers
module.exports.io = io;

// Schedule task reminders daily at 1:37 PM
cron.schedule('00 21 * * *', () => {
  console.log('Sending task reminders...');
  sendTaskReminders();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
