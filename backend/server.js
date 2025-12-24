require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const http = require('http');
const { Server } = require('socket.io');

const { sendTaskReminders } = require('./services/emailService');

const app = express();

/* =========================
   CORS CONFIG (VERY IMPORTANT)
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-frontend-domain.vercel.app" // 🔴 CHANGE THIS
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/stats', require('./routes/stats'));

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running 🚀' });
});

/* =========================
   MANUAL EMAIL TRIGGER
========================= */
app.get('/api/send-reminders', async (req, res) => {
  try {
    await sendTaskReminders();
    res.json({ message: 'Task reminders sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

/* =========================
   DATABASE CONNECTION
========================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Run cron ONLY after DB is connected
    cron.schedule('00 21 * * *', () => {
      console.log('Sending task reminders...');
      sendTaskReminders();
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

/* =========================
   SERVER + SOCKET.IO
========================= */
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinFolder', (folderId) => {
    socket.join(folderId);
    console.log(`User joined folder: ${folderId}`);
  });

  socket.on('leaveFolder', (folderId) => {
    socket.leave(folderId);
    console.log(`User left folder: ${folderId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io if controllers need it
module.exports.io = io;

/* =========================
   START SERVER
========================= */
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
