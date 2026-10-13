import os
import sys
import time
import json
import requests
import pandas as pd
from pathlib import Path
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Setup Paths with pathlib
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"

CSV_PRIMARY = DATASET_DIR / "raw" / "Fitzpatrick17k" / "fitzpatrick17k.csv"
CSV_SECONDARY = DATASET_DIR / "Fitzpatrick17k" / "fitzpatrick17k.csv"

RAW_DIR = DATASET_DIR / "raw" / "Fitzpatrick17k"
IMAGES_DIR = RAW_DIR / "images"
LOG_FILE = RAW_DIR / "download.log"
REPORT_FILE = RAW_DIR / "download_report.json"

IMAGES_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Global set of blacklisted/unavailable domains after repeated failures
FAILED_DOMAINS = set()

def download_single_image(row):
    md5 = str(row.get('md5hash', '')).strip()
    url = str(row.get('url', '')).strip()
    domain = urlparse(url).netloc if url else ""
    
    if not md5 or not url or url.lower() == 'nan':
        return {
            "md5": md5,
            "domain": domain,
            "status": False,
            "reason": "Invalid or missing URL/MD5",
            "url": url,
            "http_status": None
        }

    dest_path = IMAGES_DIR / f"{md5}.jpg"
    if dest_path.exists() and dest_path.stat().st_size > 1000:
        return {
            "md5": md5,
            "domain": domain,
            "status": True,
            "reason": "Already Exists",
            "url": url,
            "http_status": 200
        }

    if domain in FAILED_DOMAINS:
        return {
            "md5": md5,
            "domain": domain,
            "status": False,
            "reason": f"Domain {domain} marked unavailable (HTTP 404 server directory removed)",
            "url": url,
            "http_status": 404
        }

    try:
        response = requests.get(url, headers=HEADERS, timeout=(2.5, 4.0), allow_redirects=True)
        content_type = response.headers.get("Content-Type", "").lower()
        
        if response.status_code == 200:
            if "image" in content_type or len(response.content) > 2000:
                with open(dest_path, "wb") as f:
                    f.write(response.content)
                return {
                    "md5": md5,
                    "domain": domain,
                    "status": True,
                    "reason": "Success",
                    "url": url,
                    "http_status": 200
                }
            else:
                return {
                    "md5": md5,
                    "domain": domain,
                    "status": False,
                    "reason": f"Non-image Content-Type ({content_type})",
                    "url": url,
                    "http_status": 200
                }
        elif response.status_code == 404:
            return {
                "md5": md5,
                "domain": domain,
                "status": False,
                "reason": "HTTP 404 Not Found",
                "url": url,
                "http_status": 404
            }
        else:
            return {
                "md5": md5,
                "domain": domain,
                "status": False,
                "reason": f"HTTP {response.status_code}",
                "url": url,
                "http_status": response.status_code
            }
    except Exception as e:
        return {
            "md5": md5,
            "domain": domain,
            "status": False,
            "reason": f"Exception: {str(e)}",
            "url": url,
            "http_status": None
        }

def run_downloader(max_workers=16):
    csv_path = None
    if CSV_PRIMARY.exists():
        csv_path = CSV_PRIMARY
    elif CSV_SECONDARY.exists():
        csv_path = CSV_SECONDARY

    if not csv_path:
        print(f"Error: CSV file not found in {CSV_PRIMARY} or {CSV_SECONDARY}", flush=True)
        return

    print(f"Loading dataset CSV from {csv_path}...", flush=True)
    df = pd.read_csv(csv_path)
    total_records = len(df)
    
    # Calculate domain statistics
    df['domain'] = df['url'].apply(lambda u: urlparse(str(u)).netloc if pd.notnull(u) else "unknown")
    domain_counts = df['domain'].value_counts().to_dict()

    print(f"Total dataset records: {total_records}", flush=True)
    print("Domain Distribution:", flush=True)
    for dom, cnt in domain_counts.items():
        print(f"  - {dom or 'empty'}: {cnt} records", flush=True)

    # Sort so working domains (like atlasdermatologico.com.br) are processed first
    df['is_atlas'] = df['domain'].apply(lambda d: 0 if 'atlasdermatologico' in d else 1)
    df = df.sort_values(by=['is_atlas']).reset_index(drop=True)

    success_count = 0
    already_count = 0
    fail_count = 0
    domain_stats = {}
    consecutive_404s = {}

    start_time = time.time()
    results = []

    print(f"\nStarting parallel image download with {max_workers} threads...", flush=True)
    
    with open(LOG_FILE, "w", encoding="utf-8") as log_f:
        log_f.write(f"Fitzpatrick17k Image Download Log - Started {time.ctime()}\n")
        log_f.write("=========================================================\n")

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_row = {executor.submit(download_single_image, row): row for _, row in df.iterrows()}
            
            for i, future in enumerate(as_completed(future_to_row), 1):
                res = future.result()
                results.append(res)
                
                dom = res["domain"] or "unknown"
                if dom not in domain_stats:
                    domain_stats[dom] = {"success": 0, "failed": 0, "existing": 0}

                if res["status"]:
                    if res["reason"] == "Already Exists":
                        already_count += 1
                        domain_stats[dom]["existing"] += 1
                    else:
                        success_count += 1
                        domain_stats[dom]["success"] += 1
                    consecutive_404s[dom] = 0
                else:
                    fail_count += 1
                    domain_stats[dom]["failed"] += 1
                    log_f.write(f"FAILED [{res['md5']}] ({dom}): {res['reason']} | URL: {res['url']}\n")

                    if res["http_status"] == 404:
                        consecutive_404s[dom] = consecutive_404s.get(dom, 0) + 1
                        if consecutive_404s[dom] >= 20 and dom not in FAILED_DOMAINS:
                            FAILED_DOMAINS.add(dom)
                            print(f"\n[NOTICE] Domain '{dom}' returned 20 consecutive HTTP 404s. Fast-skipping remaining requests for this domain.", flush=True)

                if i % 250 == 0 or i == total_records:
                    elapsed = time.time() - start_time
                    print(f"Progress: {i}/{total_records} | Success: {success_count} | Existing: {already_count} | Failed: {fail_count} | Elapsed: {elapsed:.1f}s", flush=True)

    elapsed_total = time.time() - start_time

    # Generate JSON report
    report = {
        "timestamp": time.ctime(),
        "total_records": total_records,
        "newly_downloaded": success_count,
        "already_existing": already_count,
        "failed_records": fail_count,
        "elapsed_seconds": round(elapsed_total, 2),
        "domain_summary": domain_stats,
        "sample_failed_urls": [r for r in results if not r["status"]][:20]
    }

    with open(REPORT_FILE, "w", encoding="utf-8") as rf:
        json.dump(report, rf, indent=2)

    print("\n=========================================================", flush=True)
    print(f"DOWNLOAD PROCESS COMPLETED in {elapsed_total:.1f}s", flush=True)
    print(f"Newly Downloaded: {success_count}", flush=True)
    print(f"Already Existing: {already_count}", flush=True)
    print(f"Failed / Unavailable: {fail_count}", flush=True)
    print("---------------------------------------------------------", flush=True)
    print("Domain Performance Summary:", flush=True)
    for dom, st in domain_stats.items():
        print(f"  - {dom or 'empty'}: {st['success'] + st['existing']} available / {st['failed']} failed", flush=True)
    print("=========================================================", flush=True)
    print(f"Images folder: {IMAGES_DIR}", flush=True)
    print(f"Detailed log: {LOG_FILE}", flush=True)
    print(f"Download report: {REPORT_FILE}", flush=True)

if __name__ == "__main__":
    workers = 16
    if len(sys.argv) > 1:
        try:
            workers = int(sys.argv[1])
        except ValueError:
            pass
    run_downloader(max_workers=workers)
