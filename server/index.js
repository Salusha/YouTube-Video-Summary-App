// server/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Use full path to Python from your virtual environment
const pythonPath = `"C:\\Users\\Salusha\\YT Summary\\YouTube-Video-Summary-App\\python-summarizer\\.env\\Scripts\\python.exe"`;

// ✅ Always use absolute path and wrap in quotes
const scriptPath = `"${path.join(__dirname, '../python-summarizer/summarize.py')}"`;

app.post('/summarize', (req, res) => {
  const videoUrl = req.body.url;
  console.log("✅ Received URL:", videoUrl);

  const command = `${pythonPath} ${scriptPath} "${videoUrl}"`;
  console.log("🔧 Executing:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Python Error:", error.message);
      console.error("stderr:", stderr);
      return res.status(500).json({ error: stderr || error.message });
    }

    try {
      const result = JSON.parse(stdout);
      console.log("✅ Python Output:", result);
      res.json(result);
    } catch (e) {
      console.error("❌ JSON Parse Error:", e.message);
      console.error("stdout:", stdout);
      res.status(500).json({ error: "Failed to parse Python output" });
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
