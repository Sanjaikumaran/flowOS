const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const Avatar = require("../models/Avatar");

// helpers
function computeLevel(xp) {
  let lvl = 1;
  let threshold = 100;
  while (xp >= threshold) {
    lvl++;
    xp -= threshold;
    threshold = Math.floor(threshold * 1.5);
  }
  return lvl;
}

// get tasks for user
router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(tasks);
});

// create task
router.post("/", auth, async (req, res) => {
  const { title, desc, due, avatar, xpValue, subtasks } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const task = new Task({
    userId: req.user.id,
    title,
    desc,
    due: due ? new Date(due) : null,
    avatar: avatar || "Producer",
    xpValue: xpValue || 10,
    subtasks: (subtasks || []).map((s) => ({ title: s, done: false })),
  });
  await task.save();
  res.json(task);
});

// update task
router.put("/:id", async (req, res) => {
  try {
    const { title, desc, priority, deadline, subtasks } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, desc, priority, deadline, subtasks },
      { new: true } // return the updated task
    );
    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// toggle complete/reopen
router.patch("/:id/toggle", auth, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
  if (!task) return res.status(404).json({ error: "not found" });

  if (task.status !== "completed") {
    task.status = "completed";
    task.completedAt = new Date();
    await task.save();
    // award XP to avatar
    const avatarDoc = await Avatar.findOne({
      userId: req.user.id,
      name: task.avatar,
    });
    if (avatarDoc) {
      const award = task.xpValue || 10;
      avatarDoc.xp += award;
      avatarDoc.level = computeLevel(avatarDoc.xp);
      await avatarDoc.save();
      return res.json({ task, avatar: avatarDoc });
    }
    return res.json({ task });
  } else {
    // reopen - rollback xp
    const avatarDoc = await Avatar.findOne({
      userId: req.user.id,
      name: task.avatar,
    });
    if (avatarDoc) {
      const award = task.xpValue || 10;
      avatarDoc.xp = Math.max(0, avatarDoc.xp - award);
      avatarDoc.level = computeLevel(avatarDoc.xp);
      await avatarDoc.save();
    }
    task.status = "pending";
    task.completedAt = null;
    await task.save();
    return res.json({ task, avatar: avatarDoc || null });
  }
});

// delete
router.delete("/:id", auth, async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ success: true });
});

router.post("/subtask/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title)
      return res.status(400).json({ error: "Subtask title required" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.subtasks = task.subtasks || [];
    task.subtasks.push({ title, done: false });
    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// toggle subtask
router.patch("/:id/subtasks/:sidx/toggle", auth, async (req, res) => {
  const { id, sidx } = req.params;
  const task = await Task.findOne({ _id: id, userId: req.user.id });
  if (!task) return res.status(404).json({ error: "not found" });
  const idx = parseInt(sidx, 10);
  if (!task.subtasks[idx])
    return res.status(400).json({ error: "invalid index" });
  task.subtasks[idx].done = !task.subtasks[idx].done;
  // if all subtasks done => complete and award xp
  if (task.subtasks.length > 0 && task.subtasks.every((s) => s.done)) {
    task.status = "completed";
    task.completedAt = new Date();
    const avatarDoc = await Avatar.findOne({
      userId: req.user.id,
      name: task.avatar,
    });
    if (avatarDoc) {
      const award = Math.max(5, task.xpValue || 10);
      avatarDoc.xp += award;
      avatarDoc.level = computeLevel(avatarDoc.xp);
      await avatarDoc.save();
    }
  }
  await task.save();
  res.json({ task });
});

module.exports = router;
