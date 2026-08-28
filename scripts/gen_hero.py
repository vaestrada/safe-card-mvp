#!/usr/bin/env python3
"""Generate a short ambient hero video via Veo 3.1 Lite from the OG plate."""
import json, os, time, base64, urllib.request

OUT = r"C:\Users\viron\projects\safe-card-mvp\public\assets\hero.mp4"
PLATE = r"C:\Users\viron\projects\safe-card-mvp\public\assets\og-raw.png"

key = None
for line in open(r"C:\Users\viron\AppData\Local\hermes\.env"):
    if line.startswith("GEMINI_API_KEY="):
        key = line.split("=", 1)[1].strip()
assert key

with open(PLATE, "rb") as f:
    plate_b64 = base64.b64encode(f.read()).decode()

body = json.dumps({
    "instances": [{
        "prompt": ("Slow gentle push-in on the woman and her phone, soft natural window light, "
                   "calm hopeful mood, subtle ambient motion, no text, no watermark"),
        "image": {"bytesBase64Encoded": plate_b64, "mimeType": "image/png"},
    }],
    "parameters": {"aspectRatio": "16:9", "resolution": "720p", "durationSeconds": 8},
}).encode()

req = urllib.request.Request(
    "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-lite-generate-preview:predictLongRunning",
    data=body,
    headers={"Content-Type": "application/json", "x-goog-api-key": key},
    method="POST",
)

def fetch(url, timeout=300):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode())

try:
    resp = fetch(req)
except urllib.error.HTTPError as e:
    print("VEOCREATE_HTTP", e.code, e.read().decode()[:400])
    raise SystemExit(1)

op = resp.get("name")
print("OP:", op)

video_uri = None
for i in range(60):  # up to ~10 min
    time.sleep(10)
    st = fetch(f"https://generativelanguage.googleapis.com/v1beta/{op}") if not op.startswith("http") else fetch(op)
    if st.get("done"):
        samples = st.get("response", {}).get("generatedSamples", [])
        if samples:
            video_uri = samples[0].get("video", {}).get("uri")
        print("DONE", "URI_FOUND" if video_uri else "NO_URI")
        break
    print("poll", i, "state:", st.get("metadata", {}).get("state") or st.get("done"))

if not video_uri:
    print("VEOSAMPLES_MISSING")
    raise SystemExit(1)

with urllib.request.urlopen(video_uri, timeout=300) as r, open(OUT, "wb") as f:
    f.write(r.read())
print("SAVED", OUT, os.path.getsize(OUT))
