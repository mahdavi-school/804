// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize the app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Storage for muted users and admin status
let mutedUsers = new Map(); // Tracks muted users
let admins = new Set(); // Admin usernames

// Example: Add admin usernames (you can update this list)
admins.add('Admin1');
admins.add('Admin2');

// Handle new socket connections
io.on('connection', (socket) => {
  const username = socket.handshake.query.username;

  console.log(`${username} connected`);

  // Welcome message for new connections
  socket.emit('botMessage', `Welcome to the chat, ${username}!`);

  // Handle incoming messages
  socket.on('message', (msg) => {
    if (mutedUsers.has(username)) {
      const remaining = mutedUsers.get(username) - Date.now();
      if (remaining > 0) {
        socket.emit('error', `You're muted for ${Math.ceil(remaining / 1000)} seconds.`);
        return;
      } else {
        mutedUsers.delete(username);
      }
    }

    const messageData = { username, msg };
    io.emit('message', messageData);
  });

  // Admin-specific actions: mute users
  socket.on('mute', (targetUser) => {
    if (admins.has(username)) {
      mutedUsers.set(targetUser, Date.now() + 30 * 60 * 1000); // Mute for 30 minutes
      io.emit('botMessage', `${targetUser} has been muted by an admin.`);
    }
  });

  // Admin-specific actions: unmute users
  socket.on('unmute', (targetUser) => {
    if (admins.has(username)) {
      mutedUsers.delete(targetUser);
      io.emit('botMessage', `${targetUser} has been unmuted by an admin.`);
    }
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log(`${username} disconnected`);
  });
});

// Start the server on port 8080
server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
