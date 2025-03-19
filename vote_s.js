const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

// تنظیمات میدل‌ویرها
app.use(cors());
app.use(bodyParser.json());

// اتصال به دیتابیس MongoDB
mongoose.connect("mongodb://localhost:27017/pollSystem", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// تعریف مدل‌ها
const PollSchema = new mongoose.Schema({
    title: String,
    options: [{ text: String, votes: { type: Number, default: 0 } }],
});

const Poll = mongoose.model("Poll", PollSchema);

// مسیر ایجاد نظرسنجی
app.post("/createPoll", async (req, res) => {
    const { title, options } = req.body;

    const newPoll = new Poll({
        title,
        options: options.map(option => ({ text: option, votes: 0 })),
    });

    await newPoll.save();
    res.status(201).json({ message: "Poll created successfully", poll: newPoll });
});

// مسیر دریافت همه نظرسنجی‌ها
app.get("/polls", async (req, res) => {
    const polls = await Poll.find();
    res.status(200).json(polls);
});

// مسیر رأی‌دادن به یک گزینه
app.post("/vote/:pollId", async (req, res) => {
    const { pollId } = req.params;
    const { optionIndex } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    poll.options[optionIndex].votes += 1;
    await poll.save();

    res.status(200).json({ message: "Vote registered successfully", poll });
});

// شروع سرور
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
