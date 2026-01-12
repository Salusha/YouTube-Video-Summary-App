const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors({origin: 'http://localhost:8080' }));
app.use(bodyParser.json());

// ✅ Using system Python (no venv needed)
const pythonPath = "python";
const scriptPath = `"${path.join(__dirname, '../python-summarizer/summarize.py')}"`;

app.post('/summarize', (req, res) => {
  const videoUrl = req.body.url;
  console.log("✅ Received URL:", videoUrl);

  // Validate URL format
  if (!videoUrl || !videoUrl.includes('youtube')) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  const command = `${pythonPath} ${scriptPath} "${videoUrl}"`;
  console.log("🔧 Executing:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Python Error:", error.message);
      console.error("stderr:", stderr);
      return res.status(500).json({ error: `Python execution failed: ${stderr || error.message}` });
    }

    try {
      const result = JSON.parse(stdout);
      console.log("✅ Python Output:", result);
      res.json(result);
    } catch (e) {
      console.error("❌ JSON Parse Error:", e.message);
      console.error("stdout:", stdout);
      res.status(500).json({ error: `Failed to parse response: ${stdout.substring(0, 200)}` });
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
