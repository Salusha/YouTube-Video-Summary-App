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


from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline, AutoTokenizer
import torch
import sys
import json

device = 0 if torch.cuda.is_available() else -1
MODEL_NAME = "sshleifer/distilbart-cnn-12-6"
summarizer = pipeline("summarization", model=MODEL_NAME, device=device)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
        return " ".join([item["text"] for item in transcript])
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

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
        return " ".join(final_summaries)
    else:
        return summarize_chunk(combined_summary)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing YouTube URL argument"}))
        sys.exit(1)

    video_url = sys.argv[1]
    video_id = video_url.split("v=")[-1].split("&")[0]

    print("Fetching transcript...", file=sys.stderr)
    transcript = get_transcript(video_id)

    print("Generating summary...", file=sys.stderr)
    summary = summarize_long_text(transcript)

    print(json.dumps({"summary": summary}, ensure_ascii=False))
