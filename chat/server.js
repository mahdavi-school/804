const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const Filter = require("bad-words");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// نگهداری کاربرانی که میوت شده‌اند (به همراه زمان انقضا)
let mutedUsers = {};

// ادمین تنها "امیرعلی گرانمایه" است
const adminUsername = "امیرعلی گرانمایه" ;

// سرو فایل‌های استاتیک از پوشه public (INDEX.html و موارد دیگر)َ
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  const username = socket.handshake.query.username || "Anonymous";
  // تعیین نقش: اگر نام کاربری دقیقاً برابر با ادمین است، نقش admin قرار می‌گیرد
  socket.username = username;
  socket.userRole = (username === adminUsername) ? "admin" : "user";

  console.log(`CHAT ${username} متصل شد.`);

  // دریافت پیام از کلاینت
  socket.on("chatMessage", (msgData) => {
    // اگر کاربر میوت شده و زمان میوت هنوز به اتمام نرسیده، اجازه ارسال پیام داده نمی‌شود
    if (mutedUsers[socket.username] && mutedUsers[socket.username] > Date.now()) {
      socket.emit("message", {
        system: true,
        text: `🚫 شما تا ${new Date(mutedUsers[socket.username]).toLocaleTimeString()} میوت هستید`
      });
      return;
    }

    // استفاده از فیلتر برای حذف کلمات نامناسب
    const filter = new Filter();
    filter.addWords("badword1", "badword2"); // در صورت نیاز کلمات نامناسب را اضافه کن

    if (filter.isProfane(msgData.text)) {
      // در صورت ارسال کلمات نامناسب، کاربر ۳۰ دقیقه میوت می‌شود
      mutedUsers[socket.username] = Date.now() + 30 * 60 * 1000;
      io.emit("message", {
        system: true,
        text: `🚫 ${socket.username} به مدت 30 دقیقه میوت شد به دلیل کلمات نامناسب`
      });
      return;
    }

    // ارسال پیام به همه (ویژگی ریپلای: فیلد replyTo در صورت وجود ارسال می‌شود)
    io.emit("message", {
      username: socket.username,
      role: socket.userRole,
      text: msgData.text,
      replyTo: msgData.replyTo || null
    });
  });

  // رویداد میوت کردن کاربر (فقط توسط ادمین)
  socket.on("muteUser", (targetUsername) => {
    if (socket.username !== adminUsername) {
      socket.emit("message", { system: true, text: "🚫 شما اجازه میوت کردن ندارید" });
      return;
    }
    if (targetUsername === adminUsername) {
      socket.emit("message", { system: true, text: "🚫 نمی‌توانید ادمین را میوت کنید!" });
      return;
    }

    mutedUsers[targetUsername] = Date.now() + 30 * 60 * 1000;
    io.emit("message", {
      system: true,
      text: `🚫 ${targetUsername} توسط ادمین به مدت 30 دقیقه میوت شد`
    });
  });

  // رویداد آن‌میوت کردن کاربر (فقط توسط ادمین)
  socket.on("unmuteUser", (targetUsername) => {
    if (socket.username !== adminUsername) {
      socket.emit("message", { system: true, text: "🚫 شما اجازه آن‌میوت کردن ندارید" });
      return;
    }
    if (mutedUsers[targetUsername]) {
      delete mutedUsers[targetUsername];
      io.emit("message", {
        system: true,
        text: `✅ ${targetUsername} توسط ادمین از حالت میوت خارج شد`
      });
    } else {
      socket.emit("message", { system: true, text: `${targetUsername} در حالت میوت نیست` });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[CYBERPUNK] ${socket.username} قطع اتصال کرد.`);
  });
});

server.listen(PORT, () => {
  console.log(`[CYBERPUNK] سرور روی پورت ${PORT} اجرا شد! 🚀`);
});