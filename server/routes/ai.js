const express = require("express");
const auth = require("../middleware/auth");
const axios = require("axios");

const router = express.Router();

router.post("/ai-extract", auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  const prompt = `
  You are a helpful task parser AI.
  
  Extract task details from the text below.
  
  Return ONLY valid JSON (no explanations, no markdown). 
  Include: 
  - "title" (string)
  - "priority" (High, Medium, Low — default Medium if not mentioned)
  - "deadline" (ISO format YYYY-MM-DDTHH:mm if possible)
  - "subtasks" (array of strings, if mentioned)
  
  Special Instructions (RPM Parsing):
  1. If only a time is given (e.g., "by 5 PM" or "at 8:30"), assume today's date.
  2. If that time has already passed for today, assume tomorrow's date.
  3. If both date and time are missing, leave "deadline" empty.
  4. If the text implies urgency (e.g., 'immediately', 'now', 'soon'), set deadline to current time + 1 hour.
  5. Never wrap output in \`\`\`json or extra words — return pure JSON.
  
  Text: "${text}"
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();

    try {
      // Try parsing if it’s valid JSON
      const json = JSON.parse(content);
      res.json(json);
    } catch {
      // If not JSON, send raw AI text
      res.json({ text: content });
    }
  } catch (err) {
    console.error("AI extraction error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI extraction failed" });
  }
});

module.exports = router;
