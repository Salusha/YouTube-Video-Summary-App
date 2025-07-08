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

# summarize.py
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline, AutoTokenizer
import sys
import json

# Load the summarizer and tokenizer once
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")

def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
        full_text = " ".join([item["text"] for item in transcript])
        return full_text
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

def chunk_text(text, max_tokens=1000):
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0

    for word in words:
        token_length = len(tokenizer.tokenize(word))
        if current_length + token_length <= max_tokens:
            current_chunk.append(word)
            current_length += token_length
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_length = token_length
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

def summarize_long_text(text):
    chunks = chunk_text(text)
    summaries = []

    for i, chunk in enumerate(chunks):
        try:
            summary = summarizer(
                chunk,
                max_length=250,  # You can increase this
                min_length=100,
                do_sample=False
            )[0]['summary_text']
            summaries.append(summary)
        except Exception as e:
            summaries.append(f"[Error summarizing chunk {i + 1}: {str(e)}]")

    # Optional: summarize all summaries into a final one
    final_input = " ".join(summaries)
    final_summary = summarizer(
        final_input,
        max_length=300,
        min_length=150,
        do_sample=False
    )[0]['summary_text']

    return final_summary

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing YouTube URL argument"}))
        sys.exit(1)

    video_url = sys.argv[1]
    video_id = video_url.split("v=")[-1].split("&")[0]
    transcript = get_transcript(video_id)
    summary = summarize_long_text(transcript)
    print(json.dumps({"summary": summary}))
