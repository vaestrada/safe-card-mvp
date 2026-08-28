#!/usr/bin/env python3
"""Hero ambient clip via Omni Flash (Interactions API). No dialogue."""
import json, os, time, base64, urllib.request

OUT = r"C:\Users\viron\projects\safe-card-mvp\public\assets\hero.mp4"

key = None
for line in open(r"C:\Users\viron\AppData\Local\hermes\.env"):
    if line.startswith("GEMINI_API_KEY="):
        key = line.split("=", 1)[1].strip()
assert key

body = json.dumps({
    "model": "gemini-omni-flash-preview",
    "input": [{
        "type": "text",
        "text": ("Wide 16:9 landscape cinematic shot, a Filipina household helper in her late 40s "
                 "standing in a warm sunlit Filipino kitchen, holding a smartphone, calm hopeful smile, "
                 "slow gentle camera push-in, soft natural window light, ambient room tone only, "
                 "no dialogue, no speech, no on-screen text, no watermark, 8 seconds")
    }],
    "response_modalities": ["video"],
}).encode()

def fetch(url, timeout=600):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode())

try:
    resp = fetch(urllib.request.Request(
        "https://generativelanguage.googleapis.com/v1beta/interactions?api_version=v1beta",
        data=body, headers={"Content-Type": "application/json", "x-goog-api-key": key}, method="POST"))
except urllib.error.HTTPError as e:
    print("OMNI_HTTP", e.code, e.read().decode()[:400])
    raise SystemExit(1)

iid = resp.get("id") or resp.get("name")
print("INTERACTION:", iid)

video_b64 = None
for i in range(48):  # up to ~8 min
    time.sleep(10)
    st = fetch(f"https://generativelanguage.googleapis.com/v1beta/interactions/{iid}")
    done = st.get("status") in ("completed", "done", "COMPLETED", "error", "ERROR")
    for step in st.get("steps", []) or st.get("interaction", {}).get("steps", []):
        if step.get("type") == "model_output":
            for part in step.get("content", {}).get("parts", []):
                if part.get("mimeType", "").startswith("video") and part.get("data"):
                    video_b64 = part["data"]
    if done or video_b64:
        print("STATUS:", st.get("status"), "VIDEO:", bool(video_b64))
        break
    print("poll", i, st.get("status"))

if not video_b64:
    print("OMNI_NO_VIDEO")
    raise SystemExit(1)

with open(OUT, "wb") as f:
    f.write(base64.b64decode(video_b64))
print("SAVED", OUT, os.path.getsize(OUT))
