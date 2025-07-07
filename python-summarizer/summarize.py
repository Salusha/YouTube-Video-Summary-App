# summarize.py
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline
import sys
import json

def get_transcript(video_id):
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    full_text = " ".join([item["text"] for item in transcript])
    return full_text

def summarize_text(text):
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    summary = summarizer(text[:1024], max_length=150, min_length=40, do_sample=False)
    return summary[0]['summary_text']

if __name__ == "__main__":
    video_url = sys.argv[1]
    video_id = video_url.split("v=")[-1].split("&")[0]
    transcript = get_transcript(video_id)
    summary = summarize_text(transcript)
    print(json.dumps({"summary": summary}))
