const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Avatar = require("../models/Avatar");

// get avatars for user
router.get("/", auth, async (req, res) => {
  const avatars = await Avatar.find({ userId: req.user.id });
  res.json(avatars);
});

// optional: reset or update avatar xp (admin action)
router.post("/reset", auth, async (req, res) => {
  const avatars = await Avatar.find({ userId: req.user.id });
  for (let a of avatars) {
    a.xp = 0;
    a.level = 1;
    await a.save();
  }
  res.json({ ok: true });
});

module.exports = router;
