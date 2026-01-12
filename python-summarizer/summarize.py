# # summarize.py
# from youtube_transcript_api import YouTubeTranscriptApi
# from transformers import pipeline
# import sys
# import json

# def get_transcript(video_id):
#     transcript = YouTubeTranscriptApi.get_transcript(video_id)
#     full_text = " ".join([item["text"] for item in transcript])
#     return full_text

# def summarize_text(text):
#     summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
#     summary = summarizer(text[:1024], max_length=150, min_length=40, do_sample=False)
#     return summary[0]['summary_text']

# if __name__ == "__main__":
#     video_url = sys.argv[1]
#     video_id = video_url.split("v=")[-1].split("&")[0]
#     transcript = get_transcript(video_id)
#     summary = summarize_text(transcript)
#     print(json.dumps({"summary": summary}))


import yt_dlp
from transformers import pipeline, AutoTokenizer
import torch
import sys
import json
import os

device = 0 if torch.cuda.is_available() else -1
MODEL_NAME = "sshleifer/distilbart-cnn-12-6"
summarizer = pipeline("summarization", model=MODEL_NAME, device=device)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def get_transcript(video_url):
    try:
        ydl_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'skip_download': True,
            'subtitlesformat': 'json3',
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            
            # Get subtitles
            import requests
            subtitle_url = None
            
            # Try manual subtitles first (usually better quality)
            if 'subtitles' in info and 'en' in info['subtitles']:
                for sub in info['subtitles']['en']:
                    if sub['ext'] == 'json3':
                        subtitle_url = sub['url']
                        break
            
            # Try automatic captions if no manual ones
            if not subtitle_url and 'automatic_captions' in info and 'en' in info['automatic_captions']:
                for sub in info['automatic_captions']['en']:
                    if sub['ext'] == 'json3':
                        subtitle_url = sub['url']
                        break
            
            if not subtitle_url:
                error_msg = "This video doesn't have English subtitles/captions available. Please try a different video with English captions enabled."
                print(json.dumps({"error": error_msg}), file=sys.stdout)
                sys.exit(0)
            
            # Fetch subtitle JSON
            response = requests.get(subtitle_url)
            data = response.json()
            
            # Extract clean text from JSON3 format
            text_parts = []
            if 'events' in data:
                for event in data['events']:
                    if 'segs' in event:
                        for seg in event['segs']:
                            if 'utf8' in seg:
                                text = seg['utf8'].strip()
                                # Skip empty strings and newlines
                                if text and text != '\n':
                                    text_parts.append(text)
            
            # Join and clean up
            full_text = ' '.join(text_parts)
            
            # Remove common YouTube spam/metadata phrases
            spam_phrases = [
                'subscribe', 'like', 'comment', 'share', 'bell icon', 'notification',
                'click here', 'link in description', 'check out', 'patreon',
                'full transcript', 'audio version', 'don\'t forget', 'please',
                'video below', 'next video', 'previous video'
            ]
            
            # Convert to lowercase for checking
            text_lower = full_text.lower()
            
            # Find where spam content starts (usually toward the end)
            spam_start = len(full_text)
            for phrase in spam_phrases:
                idx = text_lower.rfind(phrase)  # Find last occurrence
                if idx != -1 and idx < spam_start:
                    # Check if this is in the last 20% of the text
                    if idx > len(full_text) * 0.8:
                        spam_start = idx
            
            # Truncate at spam if found
            if spam_start < len(full_text):
                full_text = full_text[:spam_start]
            
            # Fix encoding issues - replace problematic characters
            full_text = full_text.encode('ascii', 'ignore').decode('ascii')
            
            # Remove multiple spaces
            full_text = ' '.join(full_text.split())
            
            return full_text if full_text else None
                
    except Exception as e:
        # User-friendly error messages instead of technical details
        error_type = type(e).__name__
        
        if 'network' in str(e).lower() or 'connection' in str(e).lower():
            error_msg = "Unable to connect to YouTube. Please check your internet connection and try again."
        elif 'timeout' in str(e).lower():
            error_msg = "Request timed out. YouTube may be temporarily unavailable. Please try again in a moment."
        elif 'unavailable' in str(e).lower() or 'private' in str(e).lower():
            error_msg = "This video is unavailable or private. Please try a different video."
        elif 'age' in str(e).lower() or 'restricted' in str(e).lower():
            error_msg = "This video has age restrictions or content restrictions that prevent transcript access."
        else:
            error_msg = "Unable to process this video. Please try a different video or check if captions are available."
        
        print(json.dumps({"error": error_msg}), file=sys.stdout)
        sys.exit(0)

def chunk_text(text, max_tokens=900):
    words = text.split()
    chunks, current_chunk, current_length = [], [], 0

    for word in words:
        token_len = len(tokenizer.tokenize(word))
        if current_length + token_len <= max_tokens:
            current_chunk.append(word)
            current_length += token_len
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_length = token_len

    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

def summarize_chunk(chunk):
    token_count = len(tokenizer.tokenize(chunk))
    max_len = min(384, int(token_count * 0.7))
    min_len = max(30, int(token_count * 0.3))
    if min_len >= max_len:
        min_len = max(20, max_len - 20)

    return summarizer(
        chunk,
        max_length=max_len,
        min_length=min_len,
        do_sample=False
    )[0]["summary_text"]

def summarize_long_text(text):
    chunks = chunk_text(text)
    first_level_summaries = []

    for i, chunk in enumerate(chunks):
        try:
            first_level_summaries.append(summarize_chunk(chunk))
        except Exception as e:
            first_level_summaries.append(f"[Error in chunk {i + 1}: {str(e)}]")

    combined_summary = " ".join(first_level_summaries)
    combined_tokens = tokenizer.tokenize(combined_summary)

    if len(combined_tokens) > 1024:
        second_level_chunks = chunk_text(combined_summary, max_tokens=800)
        final_summaries = []
        for i, chunk in enumerate(second_level_chunks):
            try:
                final_summaries.append(summarize_chunk(chunk))
            except Exception as e:
                final_summaries.append(f"[Error in final chunk {i + 1}: {str(e)}]")
        final_text = " ".join(final_summaries)
    else:
        final_text = summarize_chunk(combined_summary)
    
    # Ensure summary ends with proper punctuation
    final_text = final_text.strip()
    if final_text and final_text[-1] not in '.!?':
        # Find last sentence ending
        last_period = max(final_text.rfind('.'), final_text.rfind('!'), final_text.rfind('?'))
        if last_period > len(final_text) * 0.7:  # If we found a sentence ending in last 30%
            final_text = final_text[:last_period + 1]
        else:
            final_text += '.'
    
    return final_text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing YouTube URL argument"}))
        sys.exit(1)

    video_url = sys.argv[1]

    print("Fetching transcript...", file=sys.stderr)
    transcript = get_transcript(video_url)
    
    if not transcript:
        print(json.dumps({"error": "Unable to extract transcript. The video may not have English captions available."}))
        sys.exit(0)

    print("Generating summary...", file=sys.stderr)
    summary = summarize_long_text(transcript)

    print(json.dumps({"summary": summary}, ensure_ascii=False))
