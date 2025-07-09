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

#summarize.py
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline, AutoTokenizer
import sys
import json

# Load summarizer and tokenizer once
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")

def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
        return " ".join([item["text"] for item in transcript])
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

def chunk_text(text, max_tokens=1000):
    words = text.split()
    chunks, current_chunk, current_length = [], [], 0

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

def summarize_chunk(chunk):
    token_count = len(tokenizer.tokenize(chunk))
    max_len = min(512, int(token_count * 0.7))
    min_len = max(30, int(token_count * 0.3))
    if min_len >= max_len:
        min_len = max(20, max_len - 20)

    return summarizer(
        chunk,
        max_length=max_len,
        min_length=min_len,
        do_sample=False
    )[0]['summary_text']

def summarize_long_text(text):
    chunks = chunk_text(text)
    summaries = []

    for i, chunk in enumerate(chunks):
        try:
            summaries.append(summarize_chunk(chunk))
        except Exception as e:
            summaries.append(f"[Error summarizing chunk {i + 1}: {str(e)}]")

    final_input = " ".join(summaries)
    tokens = tokenizer(final_input, truncation=True, max_length=1024, return_tensors="pt")

    final_input = tokenizer.decode(tokens.input_ids[0], skip_special_tokens=True)
    final_token_count = tokens.input_ids.shape[1]

    if final_token_count <= 100:
        return final_input  # already short, skip summarizing

    final_max = min(512, int(final_token_count * 0.7))
    final_min = max(50, int(final_token_count * 0.3))
    if final_min >= final_max:
        final_min = max(30, final_max - 20)

    return summarizer(
        final_input,
        max_length=final_max,
        min_length=final_min,
        do_sample=False
    )[0]['summary_text']

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing YouTube URL argument"}))
        sys.exit(1)

    video_url = sys.argv[1]
    video_id = video_url.split("v=")[-1].split("&")[0]

    transcript = get_transcript(video_id)
    summary = summarize_long_text(transcript)
    print(json.dumps({"summary": summary}))
