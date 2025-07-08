// // client/src/App.js
// import { useState } from 'react';
// import axios from 'axios';

// function App() {
//   const [url, setUrl] = useState('');
//   const [summary, setSummary] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const res = await axios.post('http://localhost:5000/summarize', { url });
//     setSummary(res.data.summary);
//   };

//   return (
//     <div style={{ padding: 40 }}>
//       <h2>YouTube Summary Generator</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={url}
//           placeholder="Paste YouTube video URL..."
//           onChange={(e) => setUrl(e.target.value)}
//           style={{ width: "400px", padding: "10px" }}
//         />
//         <button type="submit" style={{ marginLeft: 10 }}>Summarize</button>
//       </form>
//       {summary && (
//         <div style={{ marginTop: 30 }}>
//           <h3>Summary:</h3>
//           <p>{summary}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await axios.post('http://localhost:5000/summarize', { url });
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero">
      <nav className="navbar">
        <div className="logo">📺 VideoSummarizer</div>
        <div className="powered">⚡ Powered by AI</div>
      </nav>

      <main className="main-content">
        <div className="icon-box">📄</div>
        <h1 className="heading">
          Transform <span className="highlight">YouTube Videos</span> <br /> into Smart Summaries
        </h1>
        <p className="description">
          Save time and get the key insights from any YouTube video with our <span className="highlight">AI-powered</span> summarization tool.
        </p>
        <div className="features">
          <span>📈 10x Faster Learning</span>
          <span>⭐ AI-Powered</span>
          <span>⚡ Instant Results</span>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            placeholder="📺 Enter YouTube URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" disabled={loading || !url}>
            {loading ? 'Summarizing...' : 'Summarize Video'}
          </button>
        </form>

        {error && <div className="error">❌ {error}</div>}

        {summary && (
          <div className="summary-box">
            <h2>📄 Summary</h2>
            <p>{summary}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
