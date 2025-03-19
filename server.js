// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files

// Store muted users and their mute expiration
let mutedUsers = new Map();
const admins = new Set(['Admin1', 'Admin2']); // Example admin usernames

// List of banned words
const bannedWords = ['کلمه۱', 'کلمه۲', 'کلمه۳']; // لیست کلمات فیلتر شده

// Handle new connections
io.on('connection', (socket) => {
  const username = socket.handshake.query.username;

  console.log(`${username} connected`);

  // Handle incoming messages
  socket.on('message', (msg) => {
    if (mutedUsers.has(username)) {
      const remaining = mutedUsers.get(username) - Date.now();
      if (remaining > 0) {
        socket.emit('error', `You're muted for ${Math.ceil(remaining / 1000)} seconds.`);
        return;
      } else {
        mutedUsers.delete(username); // Mute expired
      }
    }

    // Check for banned words
    const containsBannedWord = bannedWords.some((word) => msg.includes(word));
    if (containsBannedWord) {
      mutedUsers.set(username, Date.now() + 30 * 60 * 1000); // Mute for 30 minutes
      io.emit('botMessage', `${username} به دلیل استفاده از کلمات ممنوعه ۳۰ دقیقه سکوت شد.`);
      return;
    }

    // Broadcast message
    io.emit('message', { username, msg });
  });

  // Admin mute/unmute functionality
  socket.on('mute', (targetUser) => {
    if (admins.has(username)) {
      mutedUsers.set(targetUser, Date.now() + 30 * 60 * 1000); // Mute for 30 minutes
      io.emit('botMessage', `${targetUser} توسط ادمین سکوت شد.`);
    }
  });

  socket.on('unmute', (targetUser) => {
    if (admins.has(username)) {
      mutedUsers.delete(targetUser);
      io.emit('botMessage', `${targetUser} توسط ادمین از سکوت خارج شد.`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`${username} disconnected`);
  });
});

// Start the server
server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
