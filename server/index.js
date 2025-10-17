const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors({origin: 'http://localhost:8080' }));
app.use(bodyParser.json());

// ✅ Corrected path
const pythonPath = `"C:\\Users\\Salusha\\YT_Summary\\python-summarizer\\.env\\Scripts\\python.exe"`;
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
