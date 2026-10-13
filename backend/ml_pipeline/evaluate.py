import json
import numpy as np
import pandas as pd
import tensorflow as tf
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"
TEST_DIR = DATASET_DIR / "test"
VAL_DIR = DATASET_DIR / "val"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
REPORTS_DIR = BASE_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Path to 8-Class Experimental Model & Indices
MODEL_PATH = SAVED_MODELS_DIR / "dermai_mobilenetv2_8class_exp.h5"
CLASS_INDICES_PATH = SAVED_MODELS_DIR / "class_indices_8class_exp.json"

IMG_SIZE = (224, 224)
BATCH_SIZE = 16

def evaluate(eval_dir=TEST_DIR, eval_name="Held-Out Test Set"):
    if not MODEL_PATH.exists():
        print(f"Error: Model file {MODEL_PATH} not found. Please train model first.")
        return

    if not CLASS_INDICES_PATH.exists():
        print(f"Error: Class indices file {CLASS_INDICES_PATH} not found.")
        return

    with open(CLASS_INDICES_PATH, 'r', encoding="utf-8") as f:
        class_indices = json.load(f)
        idx_to_class = {int(v): k for k, v in class_indices.items()}
        class_names = [idx_to_class[i] for i in range(len(idx_to_class))]

    print(f"\nLoading experimental MobileNetV2 model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(str(MODEL_PATH))

    test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input
    )

    if not eval_dir.exists():
        print(f"Evaluation directory {eval_dir} does not exist.")
        return

    test_generator = test_datagen.flow_from_directory(
        str(eval_dir),
        classes=class_names,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )

    if test_generator.samples == 0:
        print(f"No samples found in {eval_dir}.")
        return

    print(f"Evaluating {test_generator.samples} {eval_name} images across {len(class_names)} active classes...")
    predictions = model.predict(test_generator)
    y_pred = np.argmax(predictions, axis=1)
    y_true = test_generator.classes

    report_dict = classification_report(y_true, y_pred, target_names=class_names, zero_division=0, output_dict=True)
    report_text = classification_report(y_true, y_pred, target_names=class_names, zero_division=0)
    cm = confusion_matrix(y_true, y_pred)

    print("\n=========================================================")
    print(f"      DERMAI MODEL EVALUATION REPORT ({eval_name.upper()})  ")
    print("=========================================================")
    print(report_text)

    print("\nConfusion Matrix (Rows=True, Cols=Predicted):")
    cm_df = pd.DataFrame(cm, index=class_names, columns=class_names)
    print(cm_df)

    # Save detailed JSON evaluation report
    eval_report_file = REPORTS_DIR / "evaluation_report_8class.json"
    report_payload = {
        "dataset_evaluated": eval_name,
        "model_file": str(MODEL_PATH.name),
        "total_samples": test_generator.samples,
        "class_names": class_names,
        "classification_report": report_dict,
        "confusion_matrix": cm.tolist()
    }

    with open(eval_report_file, "w", encoding="utf-8") as rf:
        json.dump(report_payload, rf, indent=2)

    print(f"\nDetailed evaluation metrics saved to {eval_report_file}")
    return report_payload

if __name__ == "__main__":
    evaluate()
