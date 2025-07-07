// client/src/App.js
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/summarize', { url });
    setSummary(res.data.summary);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>YouTube Summary Generator</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          placeholder="Paste YouTube video URL..."
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "400px", padding: "10px" }}
        />
        <button type="submit" style={{ marginLeft: 10 }}>Summarize</button>
      </form>
      {summary && (
        <div style={{ marginTop: 30 }}>
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;
