# # summarize_gpt.py
# import openai
# import sys
# import json
# from youtube_transcript_api import YouTubeTranscriptApi

# # 🔐 Paste your OpenAI key here or load from env
# openai.api_key = "sk-..."  # Replace with your real key

# def get_transcript(video_id):
#     transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
#     full_text = " ".join([item["text"] for item in transcript])
#     return full_text

# def summarize_with_gpt(text):
#     prompt = f"Summarize this YouTube transcript:\n\n{text}"

#     response = openai.ChatCompletion.create(
#         model="gpt-3.5-turbo",  # or "gpt-4" if you have access
#         messages=[
#             {"role": "system", "content": "You are a helpful summarizer."},
#             {"role": "user", "content": prompt}
#         ],
#         temperature=0.5
#     )

#     summary = response["choices"][0]["message"]["content"]
#     return summary

# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print(json.dumps({"error": "No YouTube URL provided"}))
#         sys.exit(1)

#     video_url = sys.argv[1]
#     video_id = video_url.split("v=")[-1].split("&")[0]

#     try:
#         transcript = get_transcript(video_id)
#         summary = summarize_with_gpt(transcript)
#         print(json.dumps({"summary": summary}))
#     except Exception as e:
#         print(json.dumps({"error": str(e)}))
import openai
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
import os
from dotenv import load_dotenv

# ✅ Load API key from .env file
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

# ✅ Pass API key to client
client = openai.OpenAI(api_key=api_key)

def get_transcript(video_id):
    transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
    full_text = " ".join([item["text"] for item in transcript])
    return full_text

def summarize_with_gpt(text):
    prompt = f"Summarize this YouTube transcript:\n\n{text}"

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # or "gpt-4"
        messages=[
            {"role": "system", "content": "You are a helpful summarizer."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5
    )

    return response.choices[0].message.content

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No YouTube URL provided"}))
        sys.exit(1)

    video_url = sys.argv[1]
    video_id = video_url.split("v=")[-1].split("&")[0]

    try:
        transcript = get_transcript(video_id)
        summary = summarize_with_gpt(transcript)
        print(json.dumps({"summary": summary}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
