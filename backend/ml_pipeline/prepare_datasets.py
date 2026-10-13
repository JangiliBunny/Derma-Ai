import os
import shutil
import json
import numpy as np
import pandas as pd
from pathlib import Path

# Setup Paths with pathlib
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"

# Check possible locations for Fitzpatrick17k CSV
FITZPATRICK_CSV_PRIMARY = DATASET_DIR / "raw" / "Fitzpatrick17k" / "fitzpatrick17k.csv"
FITZPATRICK_CSV_SECONDARY = DATASET_DIR / "Fitzpatrick17k" / "fitzpatrick17k.csv"

RAW_FITZPATRICK_DIR = DATASET_DIR / "raw" / "Fitzpatrick17k"
FITZPATRICK_IMAGES = RAW_FITZPATRICK_DIR / "images"

RAW_ISIC_DIR = DATASET_DIR / "raw" / "ISIC_2019"
ISIC_CSV = RAW_ISIC_DIR / "ISIC_2019_Training_GroundTruth.csv"
ISIC_IMAGES = RAW_ISIC_DIR / "ISIC_2019_Training_Input"

TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "val"
TEST_DIR = DATASET_DIR / "test"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
CLASS_INDICES_PATH = SAVED_MODELS_DIR / "class_indices.json"

SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# 20 DermAI Target Classes
DERMAI_TARGET_CLASSES = [
    "Melanoma", "Nevus", "Basal Cell Carcinoma", "Actinic Keratosis",
    "Dermatofibroma", "Vascular Lesion", "Benign Keratosis", "Psoriasis",
    "Eczema", "Acne", "Rosacea", "Tinea", "Vitiligo", "Warts",
    "Seborrheic Keratosis", "Lupus", "Urticaria", "Impetigo",
    "Contact Dermatitis", "Ringworm"
]

# Strict Verified Mapping for Fitzpatrick17k (Excludes ambiguous/overlapping/unsupported labels)
FITZPATRICK_LABEL_MAP = {
    "acne": "Acne",
    "actinic keratosis": "Actinic Keratosis",
    "basal cell carcinoma": "Basal Cell Carcinoma",
    "keratosis pilaris": "Benign Keratosis",
    "allergic contact dermatitis": "Contact Dermatitis",
    "dermatofibroma": "Dermatofibroma",
    "dyshidrotic eczema": "Eczema",
    "lupus erythematosus": "Lupus",
    "lupus subacute": "Lupus",
    "melanoma": "Melanoma",
    "congenital nevus": "Nevus",
    "epidermal nevus": "Nevus",
    "psoriasis": "Psoriasis",
    "rhinophyma": "Rosacea",
    "rosacea": "Rosacea",
    "urticaria": "Urticaria",
    "urticaria pigmentosa": "Urticaria",
    "kaposi sarcoma": "Vascular Lesion",
    "granuloma pyogenic": "Vascular Lesion",
    "telangiectases": "Vascular Lesion",
    "vitiligo": "Vitiligo",
}

# Mapping for ISIC 2019
ISIC_LABEL_MAP = {
    "MEL": "Melanoma",
    "NV": "Nevus",
    "BCC": "Basal Cell Carcinoma",
    "AK": "Actinic Keratosis",
    "BKL": "Benign Keratosis",
    "DF": "Dermatofibroma",
    "VASC": "Vascular Lesion"
}

def clean_target_directories(active_classes):
    print("Preparing train, val, and test output directories...")
    for target_class in active_classes:
        (TRAIN_DIR / target_class).mkdir(parents=True, exist_ok=True)
        (VAL_DIR / target_class).mkdir(parents=True, exist_ok=True)
        (TEST_DIR / target_class).mkdir(parents=True, exist_ok=True)

def process_fitzpatrick():
    csv_path = None
    if FITZPATRICK_CSV_PRIMARY.exists():
        csv_path = FITZPATRICK_CSV_PRIMARY
    elif FITZPATRICK_CSV_SECONDARY.exists():
        csv_path = FITZPATRICK_CSV_SECONDARY

    if not csv_path:
        print(f"Notice: Fitzpatrick17k CSV not found. Skipping Fitzpatrick dataset.")
        return [], 0, 0

    df = pd.read_csv(csv_path)
    total_records = len(df)
    print(f"\nProcessing Fitzpatrick17k dataset from {csv_path} ({total_records} records)...")

    df['raw_label'] = df['label'].astype(str).str.strip().str.lower()
    df['mapped_class'] = df['raw_label'].map(FITZPATRICK_LABEL_MAP)
    valid_df = df[df['mapped_class'].notnull()].copy()
    excluded_count = total_records - len(valid_df)

    valid_records = []
    missing_images = 0
    
    for _, row in valid_df.iterrows():
        md5 = str(row['md5hash']).strip().lower()
        mapped_cls = row['mapped_class']
        img_file = FITZPATRICK_IMAGES / f"{md5}.jpg"
        group_id = str(row.get('url_alphanum') or md5)

        if img_file.exists() and img_file.stat().st_size > 500:
            valid_records.append({
                "image_path": img_file,
                "target_class": mapped_cls,
                "group_id": group_id,
                "md5": md5,
                "source": "Fitzpatrick17k"
            })
        else:
            missing_images += 1

    print(f"Fitzpatrick17k: {len(valid_records)} accessible & mapped images | {missing_images} missing/un-downloaded files | {excluded_count} excluded/unmapped labels")
    return valid_records, excluded_count, missing_images

def process_isic():
    if not ISIC_CSV.exists():
        print(f"Notice: ISIC 2019 CSV not found at {ISIC_CSV}. Skipping ISIC dataset.")
        return []

    df = pd.read_csv(ISIC_CSV)
    print(f"\nProcessing ISIC 2019 dataset ({len(df)} records)...")
    
    valid_records = []
    for _, row in df.iterrows():
        img_id = str(row['image']).strip()
        img_file = ISIC_IMAGES / f"{img_id}.jpg"
        
        target_cls = None
        for code, dermai_cls in ISIC_LABEL_MAP.items():
            if code in row and row[code] == 1.0:
                target_cls = dermai_cls
                break
                
        if target_cls and img_file.exists():
            valid_records.append({
                "image_path": img_file,
                "target_class": target_cls,
                "group_id": img_id,
                "md5": img_id,
                "source": "ISIC2019"
            })
            
    print(f"ISIC 2019: {len(valid_records)} accessible & mapped images found.")
    return valid_records

def main():
    # Load or preserve existing class indices
    if CLASS_INDICES_PATH.exists():
        with open(CLASS_INDICES_PATH, "r", encoding="utf-8") as f:
            class_indices = json.load(f)
        active_classes = sorted(class_indices.keys(), key=lambda k: class_indices[k])
    else:
        active_classes = sorted(DERMAI_TARGET_CLASSES)
        class_indices = {cls_name: i for i, cls_name in enumerate(active_classes)}
        with open(CLASS_INDICES_PATH, "w", encoding="utf-8") as f:
            json.dump(class_indices, f, indent=2)

    clean_target_directories(active_classes)
    
    fitz_records, excluded_cnt, missing_img_cnt = process_fitzpatrick()
    isic_records = process_isic()
    all_records = fitz_records + isic_records

    if not all_records:
        print("\n[NOTICE] No downloaded image files found in dataset/raw/ directory.")
        return

    df_records = pd.DataFrame(all_records)
    print(f"\nTotal Dataset Images to Split: {len(df_records)}")

    # Stratified Grouped Split (70% Train, 15% Val, 15% Test with Seed 42)
    train_records, val_records, test_records = [], [], []

    for cls in active_classes:
        cls_df = df_records[df_records['target_class'] == cls]
        if len(cls_df) == 0:
            continue

        groups = cls_df['group_id'].unique()
        rng = np.random.RandomState(42)
        rng.shuffle(groups)

        n_groups = len(groups)
        if n_groups == 1:
            n_train, n_val, n_test = 1, 0, 0
        elif n_groups == 2:
            n_train, n_val, n_test = 1, 1, 0
        elif n_groups == 3:
            n_train, n_val, n_test = 2, 1, 0
        elif n_groups == 4:
            n_train, n_val, n_test = 2, 1, 1
        else:
            n_train = int(round(n_groups * 0.70))
            n_val = int(round(n_groups * 0.15))
            n_test = n_groups - n_train - n_val
            if n_val == 0:
                n_val = 1
                n_train -= 1
            if n_test == 0:
                n_test = 1
                n_train -= 1

        train_grps = set(groups[:n_train])
        val_grps = set(groups[n_train:n_train + n_val])
        test_grps = set(groups[n_train + n_val:])

        train_records.append(cls_df[cls_df['group_id'].isin(train_grps)])
        val_records.append(cls_df[cls_df['group_id'].isin(val_grps)])
        test_records.append(cls_df[cls_df['group_id'].isin(test_grps)])

    train_df = pd.concat(train_records, ignore_index=True) if train_records else pd.DataFrame()
    val_df = pd.concat(val_records, ignore_index=True) if val_records else pd.DataFrame()
    test_df = pd.concat(test_records, ignore_index=True) if test_records else pd.DataFrame()

    print("\nCopying image files into train, val, and test subfolders...")
    for _, row in train_df.iterrows():
        dest = TRAIN_DIR / row['target_class'] / row['image_path'].name
        if not dest.exists():
            shutil.copy2(row['image_path'], dest)

    for _, row in val_df.iterrows():
        dest = VAL_DIR / row['target_class'] / row['image_path'].name
        if not dest.exists():
            shutil.copy2(row['image_path'], dest)

    for _, row in test_df.iterrows():
        dest = TEST_DIR / row['target_class'] / row['image_path'].name
        if not dest.exists():
            shutil.copy2(row['image_path'], dest)

    # Verify zero overlap across splits
    train_md5s = set(f.stem.lower() for f in TRAIN_DIR.rglob("*.jpg"))
    val_md5s = set(f.stem.lower() for f in VAL_DIR.rglob("*.jpg"))
    test_md5s = set(f.stem.lower() for f in TEST_DIR.rglob("*.jpg"))

    assert len(train_md5s.intersection(val_md5s)) == 0, "Overlap found between Train and Val!"
    assert len(train_md5s.intersection(test_md5s)) == 0, "Overlap found between Train and Test!"
    assert len(val_md5s.intersection(test_md5s)) == 0, "Overlap found between Val and Test!"

    print("\n=========================================================")
    print("          DERMAI DATASET SPLIT SUMMARY REPORT            ")
    print("=========================================================")
    print(f"{'Class Name':<25} | {'Train':<7} | {'Val':<7} | {'Test':<7} | {'Total':<7} | {'Status'}")
    print("-" * 75)

    low_data_classes = []
    missing_classes = []
    for cls_name in active_classes:
        t_cnt = len(list((TRAIN_DIR / cls_name).glob("*.jpg")))
        v_cnt = len(list((VAL_DIR / cls_name).glob("*.jpg")))
        te_cnt = len(list((TEST_DIR / cls_name).glob("*.jpg")))
        tot = t_cnt + v_cnt + te_cnt

        if tot == 0:
            status = "MISSING (0)"
            missing_classes.append(cls_name)
        elif tot < 20:
            status = "LOW DATA (<20)"
            low_data_classes.append(cls_name)
        else:
            status = "OK"
        print(f"{cls_name:<25} | {t_cnt:<7} | {v_cnt:<7} | {te_cnt:<7} | {tot:<7} | {status}")

    print("-" * 75)
    print(f"Total Training Images:   {len(train_df)}")
    print(f"Total Validation Images: {len(val_df)}")
    print(f"Total Testing Images:    {len(test_df)}")
    print(f"Class Index Mapping:     {CLASS_INDICES_PATH}")
    print("Split Verification:      PASSED (0 duplicate image overlap across splits)")

    if low_data_classes:
        print(f"\n[NOTICE] Severe Class Imbalance / Low Data Classes (<20 total samples):")
        print(f"  {', '.join(low_data_classes)}")
    if missing_classes:
        print(f"\n[NOTICE] Missing Classes (0 total samples):")
        print(f"  {', '.join(missing_classes)}")

if __name__ == "__main__":
    main()
