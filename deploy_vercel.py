#!/usr/bin/env python3
"""Deploy SubControl to Vercel (direct file upload). Usage: python3 deploy_vercel.py"""
import sys, os, json, hashlib, urllib.request, urllib.error, time, subprocess
sys.path.insert(0, "/opt/hatch/skills/skill-creator/bin")
from dynamic_credentials import add_surrogate_to_request, read_response_body

API = "https://api.vercel.com"
PID = "prj_tQM0QCXrReANmODuJ0GvJJYmVmf5"
ROOT = os.path.dirname(os.path.abspath(__file__))
SKIP_DIRS = {"launch"}
SKIP_FILES = {"deploy_vercel.py"}

def call(method, url, data=None, raw=None, ctype="application/json", headers=None):
    body = raw if raw is not None else (json.dumps(data).encode() if data is not None else None)
    h = {"User-Agent": "muse-subcontrol/1.0"}
    if body: h["Content-Type"] = ctype
    if headers: h.update(headers)
    r = urllib.request.Request(url, data=body, headers=h, method=method)
    add_surrogate_to_request(r, "custom.vercel", allowed_hosts=["api.vercel.com"])
    try:
        with urllib.request.urlopen(r) as resp:
            b = read_response_body(resp).decode()
            return resp.status, json.loads(b) if b else {}
    except urllib.error.HTTPError as e:
        return e.code, {"err": e.read().decode()[:300]}

def main():
    files = []
    for dp, _, fns in os.walk(ROOT):
        for fn in fns:
            full = os.path.join(dp, fn)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            if rel.split("/")[0] in SKIP_DIRS or fn in SKIP_FILES or fn.startswith("."):
                continue
            with open(full, "rb") as f: data = f.read()
            files.append({"file": rel, "sha": hashlib.sha1(data).hexdigest(),
                          "size": len(data), "data": data})
    print(f"{len(files)} files")
    for f in files:
        st, res = call("POST", f"{API}/v12/files", raw=f["data"],
                       ctype="application/octet-stream",
                       headers={"x-vercel-digest": f["sha"]})
        if st != 200:
            print("  FAILED", f["file"], st, res); sys.exit(1)
    st, dep = call("POST", f"{API}/v13/deployments", data={
        "name": "subcontrol", "project": PID, "target": "production",
        "files": [{"file": f["file"], "sha": f["sha"], "size": f["size"]} for f in files],
        "projectSettings": {"framework": None}})
    if st not in (200, 201):
        print("deploy failed", st, dep); sys.exit(1)
    did = dep["id"]
    print("deploying", did)
    for _ in range(30):
        time.sleep(15)
        st2, o2 = call("GET", f"{API}/v13/deployments/{did}")
        rs = o2.get("readyState")
        if rs in ("READY", "ERROR", "CANCELED"): break
    url = "https://" + o2["url"]
    print(rs, url)
    if rs == "READY":
        for p in ["/", "/styles.css", "/app.js", "/favicon.svg", "/site.webmanifest"]:
            r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", url + p],
                               capture_output=True, text=True)
            print(f"  {p} -> {r.stdout}")

if __name__ == "__main__":
    main()
