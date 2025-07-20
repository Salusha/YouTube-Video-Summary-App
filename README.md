# 🎥 YouTube Video Summarizer App

An AI-powered full-stack web application that generates concise summaries of YouTube videos by extracting transcripts and applying Natural Language Processing (NLP) models.

## 🚀 Features

- 🔗 Accepts YouTube video URLs and fetches English transcripts (auto-generated or manual)
- 🧠 Summarizes long-form content using advanced transformer models (BART/DistilBART)
- ⚡ Real-time summarization with loading animations and user-friendly feedback
- ✅ Robust error handling for:
  - Invalid or broken URLs
  - Videos without transcripts
  - Very long videos
- 📱 Fully responsive design for mobile, tablet, and desktop

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite setup)
- **Tailwind CSS** (for responsive and modern UI)
- Axios for HTTP requests

### Backend
- **Node.js + Express.js** – Handles API routing and request processing
- **Python** – Transcript extraction and summarization logic
  - [`youtube-transcript-api`](https://pypi.org/project/youtube-transcript-api/)
  - `transformers` from [Hugging Face](https://huggingface.co/)
    - Models: `facebook/bart-large-cnn`, `sshleifer/distilbart-cnn-12-6`

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Salusha/YouTube-Video-Summary-App.git

