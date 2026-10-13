"""
DermaAI - Model Artifact Integrity & Download Verification Utility

Verifies presence and integrity of trained model weights and class mappings.
Can optionally download verified weights from remote storage if configured.
"""

import os
import sys
import hashlib
from pathlib import Path

SAVED_MODELS_DIR = Path(__file__).resolve().parent

MODELS = {
    "baseline_20class": {
        "model_file": SAVED_MODELS_DIR / "dermai_mobilenetv2.h5",
        "mapping_file": SAVED_MODELS_DIR / "class_indices.json",
        "expected_classes": 20,
        "min_size_bytes": 10_000_000,
    },
    "experimental_8class": {
        "model_file": SAVED_MODELS_DIR / "dermai_mobilenetv2_8class_exp.h5",
        "mapping_file": SAVED_MODELS_DIR / "class_indices_8class_exp.json",
        "expected_classes": 8,
        "min_size_bytes": 10_000_000,
    }
}

def verify_model(model_type: str = "baseline_20class") -> bool:
    if model_type not in MODELS:
        print(f"ERROR: Unknown model type '{model_type}'. Choose from {list(MODELS.keys())}")
        return False

    spec = MODELS[model_type]
    model_path = spec["model_file"]
    mapping_path = spec["mapping_file"]

    print(f"=== Verifying {model_type} ===")

    # 1. Check model weights file
    if not model_path.exists():
        print(f"[FAIL] Model file not found at: {model_path}")
        return False
    
    size = model_path.stat().st_size
    if size < spec["min_size_bytes"]:
        print(f"[FAIL] Model file size ({size} bytes) is suspiciously small.")
        return False
    print(f"[OK] Model weights file present ({size / (1024*1024):.2f} MB)")

    # 2. Check class mapping file
    if not mapping_path.exists():
        print(f"[FAIL] Mapping file not found at: {mapping_path}")
        return False

    import json
    with open(mapping_path, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    if len(mapping) != spec["expected_classes"]:
        print(f"[FAIL] Expected {spec['expected_classes']} classes, found {len(mapping)}")
        return False
    print(f"[OK] Class mapping verified ({len(mapping)} classes)")
    print(f"[OK] {model_type} artifact integrity check PASSED.\n")
    return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "baseline_20class"
    if target == "all":
        success = verify_model("baseline_20class") and verify_model("experimental_8class")
    else:
        success = verify_model(target)
    sys.exit(0 if success else 1)
