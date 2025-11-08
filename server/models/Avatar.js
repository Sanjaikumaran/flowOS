const mongoose = require("mongoose");

const AvatarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
});

module.exports = mongoose.model("Avatar", AvatarSchema);
