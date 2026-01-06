import os
import google.generativeai as genai
import yt_dlp
import time
from datetime import datetime
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("Error: GEMINI_API_KEY not found in .env file")
    print("Create a .env file with: GEMINI_API_KEY=your_key_here")
    exit(1)

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

def get_playlist_videos(playlist_url):
    print(f"\n🔍 Scanning playlist...")
    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
        'ignoreerrors': True,
    }
    video_data = []
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)
        if 'entries' in info:
            for entry in info['entries']:
                # Save title and url
                video_data.append({
                    'title': entry.get('title', 'Unknown Video'),
                    'url': entry.get('url')
                })
    print(f"✅ Found {len(video_data)} videos in playlist.")
    return video_data

def analyze_video(video_url, video_title):
    print(f"   ▶️  Watching: {video_title}...")
    prompt = """
    Watch this video and extract the 'God Roll' weapon recommendations.
    Format the output as a bulleted list:
    * Weapon Name
    * PvE or PvP?
    * The specific Perks mentioned (e.g. Barrel, Mag, Traits)
    * The timestamp where the perks are shown/discussed.
    """

    try:
        # Pass the video URL directly to Gemini
        response = model.generate_content([
            {"role": "user", "parts": [
                {"text": prompt},
                {"file_data": {"mime_type": "video/mp4", "file_uri": video_url}}
            ]}
        ])
        return response.text
    except Exception as e:
        return f"⚠️ Error processing video: {e}"

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    # 1. Ask user for playlist URL
    playlist_link = input("🔗 Paste the YouTube Playlist URL: ").strip()

    # 2. specific output filename
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
    filename = f"God_Roll_Report_{timestamp}.md"

    # 3. Get videos
    videos = get_playlist_videos(playlist_link)

    print(f"\n📝 Writing results to: {filename}")
    print("-" * 40)

    # 4. Loop and Append to file
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# God Roll Report\nGenerated: {timestamp}\nSource: {playlist_link}\n\n")

        for i, video in enumerate(videos):
            title = video['title']
            url = video['url']

            # Analyze
            print(f"[{i+1}/{len(videos)}] Processing...")
            analysis = analyze_video(url, title)

            # Write to file immediately (so if it crashes, you save progress)
            f.write(f"## {i+1}. {title}\n")
            f.write(f"**URL:** {url}\n\n")
            f.write(analysis)
            f.write("\n\n---\n\n")

            # Flush to ensure it's saved
            f.flush()

            # Sleep briefly to be nice to the API
            time.sleep(2)

    print(f"\n✅ DONE! Open {filename} to see your God Rolls.")
