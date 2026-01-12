# 🎥 YouTube Video Summarizer App

An AI-powered full-stack web application that generates concise summaries of YouTube videos by extracting transcripts and applying Natural Language Processing (NLP) models.

## 🚀 Features

- 🔗 Accepts YouTube video URLs and fetches English transcripts (auto-generated or manual)
- 🧠 Summarizes long-form content using advanced transformer models (DistilBART)
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
- **Fetch API** for HTTP requests
- **Shadcn/ui** components

### Backend
- **Node.js + Express.js** – Handles API routing and request processing
- **Python** – Transcript extraction and summarization logic
  - [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) - Reliable YouTube caption extraction
  - `transformers` from [Hugging Face](https://huggingface.co/)
    - Model: `sshleifer/distilbart-cnn-12-6`
  - `torch` - PyTorch for model inference

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Salusha/YouTube-Video-Summary-App.git
cd YT_Summary
```

### 2. Install Python Dependencies

```bash
cd python-summarizer
pip install -r requirements.txt
cd ..
```

### 3. Install Node.js Dependencies

**Backend:**
```bash
cd server
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

## 🚀 Running the Application

You need to run **2 terminals** simultaneously:

### Terminal 1: Backend Server (Node.js)
```bash
cd server
node index.js
```
Server runs on: `http://localhost:5000`

### Terminal 2: Frontend Dev Server (Vite)
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:8080`


## 📂 Project Structure

```
YT_Summary/
├── frontend/           # React + Vite frontend
│   ├── client/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   └── Index.tsx
│   │   └── components/
│   └── package.json
├── server/            # Express.js backend
│   ├── index.js
│   └── package.json
├── python-summarizer/ # Python summarization logic
│   ├── summarize.py
│   └── requirements.txt
└── README.md
```

## 🔧 How It Works

1. **User submits YouTube URL** via the React frontend
2. **Frontend sends request** to Express.js backend at `/summarize`
3. **Backend calls Python script** with the video URL
4. **Python extracts transcript** using `yt-dlp`
5. **Python summarizes text** using DistilBART transformer model
6. **Summary returned** through backend to frontend
7. **User sees summary** displayed in the UI

## 🐛 Troubleshooting

**Issue:** NumPy compatibility errors
```bash
pip install --upgrade --force-reinstall "numpy>=1.22.4,<2.3.0"
pip install --upgrade --force-reinstall scikit-learn pandas scipy
```

**Issue:** Transcript extraction fails
- Make sure the video has English captions/subtitles enabled
- Try updating yt-dlp: `pip install --upgrade yt-dlp`
- Some videos may have disabled captions or age restrictions

**Issue:** CORS errors
- Ensure backend runs on `http://localhost:5000`
- Ensure frontend runs on `http://localhost:8080`

**Issue:** Processing takes too long
- Videos under 30 minutes work best (1-2 min processing)
- Longer videos (1+ hour) may take 5-10 minutes
- First run is slower due to model loading

## ⚡ Performance Notes

- **Recommended video length**: 5-30 minutes
- **Processing time (CPU)**: ~1-2 minutes for typical videos
- **GPU acceleration**: Set `device=0` in `summarize.py` if you have CUDA-compatible GPU (3-4x faster)

## 📝 Requirements

- **Python**: 3.11+
- **Node.js**: 16+
- **npm**: 8+
- **pip**: Latest version

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License

