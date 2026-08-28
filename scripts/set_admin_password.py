#!/usr/bin/env python3
"""Generate ADMIN_PASSWORD, write to .env.local + Vercel project env."""
import json, os, secrets, subprocess

PROJ = r"C:\Users\viron\projects\safe-card-mvp"
PID = "prj_nMbCVVzSLpAa4Iltj0JbyTPoiyAD"
ORG = "team_cGwnjCC7Oe9hTbIrF1ktGS1L"
NPX = r"C:\Users\viron\AppData\Local\hermes\node\npx.cmd"

pw = secrets.token_hex(12)  # 24 hex chars, never printed

# Save to a gitignored file so Viron can open it when he needs to log in
pw_file = os.path.join(PROJ, ".admin-password.txt")
with open(pw_file, "w") as f:
    f.write(pw + "\n")

# Append to .env.local
env_path = os.path.join(PROJ, ".env.local")
lines = [l for l in open(env_path).read().splitlines() if l.strip() and not l.startswith("ADMIN_PASSWORD=")]
with open(env_path, "w") as f:
    for l in lines:
        f.write(l + "\n")
    f.write(f"ADMIN_PASSWORD={pw}\n")

base_env = {k: v for k, v in os.environ.items() if k != "VERCEL_TOKEN"}

# Push to Vercel project (production + preview + development)
payload = {"key": "ADMIN_PASSWORD", "value": pw, "type": "encrypted",
           "target": ["production", "preview", "development"]}
tmp = os.path.join(os.environ.get("TEMP", PROJ), "vc_env_admin.json")
with open(tmp, "w") as f:
    json.dump(payload, f)
p = subprocess.run([NPX, "-y", "vercel", "api", f"/v10/projects/{PID}/env?teamId={ORG}",
                    "-X", "POST", "--input", tmp],
                   capture_output=True, text=True, cwd=PROJ, env=base_env, timeout=180)
out = (p.stdout + p.stderr).replace(pw, "<SECRET>")
print("VERCEL_ENV_RC:", p.returncode)
print("VERCEL_ENV_TAIL:", out[:200])
os.remove(tmp)
print("PASSWORD_FILE:", pw_file)
print("ENV_LOCAL_OK:", any(l.startswith("ADMIN_PASSWORD=") for l in open(env_path).read().splitlines()))
print("NO_SECRET_PRINTED: True")
