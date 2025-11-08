const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema({
  title: String,
  done: { type: Boolean, default: false },
});

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  desc: String,
  due: Date,
  status: { type: String, default: "pending" }, // pending/in-progress/completed
  avatar: { type: String, default: "Producer" },
  xpValue: { type: Number, default: 10 },
  subtasks: [SubtaskSchema],
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

module.exports = mongoose.model("Task", TaskSchema);
