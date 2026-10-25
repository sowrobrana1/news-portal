#!/usr/bin/env python3
"""Mirror one published Facebook item to the news-portal websites.

Usage: python3 ingest_item.py <pp|btn|sat> <published_folder>

Reads caption.txt (first line = headline; full text = body lead),
comment.txt (বিস্তারিত details appended to body), and card.png / thumb.png
(first found) from the folder, then POSTs to the portal ingest API.
Dedupes server-side on (brand, sourceFbid=folder name) — safe to re-run.
Fail-soft: prints the result and always exits 0 (a website hiccup must
never break the Facebook pipeline).
"""
import base64
import json
import pathlib
import sys
import urllib.request

BASE = "https://prothom-prohor-news.vercel.app"  # one endpoint; DB is shared
KEY_FILE = pathlib.Path(__file__).with_name(".ingest_key_local")


def main() -> None:
    brand, folder = sys.argv[1], pathlib.Path(sys.argv[2])
    caption = (folder / "caption.txt").read_text(encoding="utf-8").strip() \
        if (folder / "caption.txt").exists() else ""
    comment = (folder / "comment.txt").read_text(encoding="utf-8").strip() \
        if (folder / "comment.txt").exists() else ""
    if not caption:
        print(f"[ingest] skip {folder.name}: no caption")
        return
    headline = caption.splitlines()[0].strip()
    body = caption if not comment else caption + "\n\n" + comment

    payload = {
        "brand": brand,
        "headline": headline,
        "body": body,
        "sourceFbid": folder.name,
    }
    for img_name in ("card.png", "thumb.png"):
        img = folder / img_name
        if img.exists():
            payload["imageBase64"] = base64.b64encode(img.read_bytes()).decode()
            payload["mime"] = "image/png"
            break

    req = urllib.request.Request(
        BASE + "/api/ingest",
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "x-ingest-key": KEY_FILE.read_text().strip(),
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            print(f"[ingest] {brand}/{folder.name}: {r.read().decode()[:200]}")
    except Exception as e:  # fail-soft by design
        print(f"[ingest] {brand}/{folder.name}: FAILED {e}")


if __name__ == "__main__":
    main()
