const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "replace_this_with_a_secret";

module.exports = function (req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No auth token" });
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
