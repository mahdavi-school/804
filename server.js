const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let mutedUsers = new Map(); // ذخیره وضعیت سکوت کاربران

app.use(express.static('public'));

io.on('connection', (socket) => {
  const username = socket.handshake.query.username;

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
    io.emit('message', { username, msg });
  });

  socket.on('mute', (targetUser) => {
    if (socket.isAdmin) {
      mutedUsers.set(targetUser, Date.now() + 30 * 60 * 1000); // سکوت برای ۳۰ دقیقه
      io.emit('botMessage', `${targetUser} has been muted by an admin.`);
    }
  });

  socket.on('unmute', (targetUser) => {
    if (socket.isAdmin) {
      mutedUsers.delete(targetUser);
      io.emit('botMessage', `${targetUser} has been unmuted by an admin.`);
    }
  });
});

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
