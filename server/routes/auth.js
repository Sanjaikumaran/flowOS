const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Avatar = require("../models/Avatar");

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_a_secret";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email+password required" });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "email exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash: hash });
  await user.save();
  // create default avatars for this user
  const names = ["Producer", "Administrator", "Entrepreneur", "Integrator"];
  await Avatar.insertMany(names.map((n) => ({ userId: user._id, name: n })));
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "30d",
  });
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "invalid credentials" });
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "30d",
  });
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

module.exports = router;
