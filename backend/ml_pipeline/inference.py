import os
import numpy as np
import io
import json
from pathlib import Path
from PIL import Image
import traceback

try:
    import tensorflow as tf
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    REAL_MODEL_SUPPORT = True
except ImportError:
    REAL_MODEL_SUPPORT = False

BASE_DIR = Path(__file__).resolve().parent.parent
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
DISEASE_INFO_PATH = BASE_DIR / "medical_info" / "skin_disease_info.json"

# Model Configurations Dictionary
MODEL_CONFIGS = {
    "baseline_20class": {
        "display_name": "MobileNetV2-20Class-Baseline",
        "model_path": SAVED_MODELS_DIR / "dermai_mobilenetv2.h5",
        "mapping_path": SAVED_MODELS_DIR / "class_indices.json",
        "expected_classes": 20,
        "description": "Primary clinical screening model trained on 20 dermatological conditions."
    },
    "experimental_8class": {
        "display_name": "MobileNetV2-8Class-Experimental",
        "model_path": SAVED_MODELS_DIR / "dermai_mobilenetv2_8class_exp.h5",
        "mapping_path": SAVED_MODELS_DIR / "class_indices_8class_exp.json",
        "expected_classes": 8,
        "description": "Experimental screening model supporting 8 target conditions. Not validated for 20 classes."
    }
}

# Global model state
model = None
class_mapping = None
active_model_type = None
active_model_name = None
disease_knowledge_base = {}

def load_knowledge_base():
    global disease_knowledge_base
    if DISEASE_INFO_PATH.exists():
        try:
            with open(DISEASE_INFO_PATH, "r", encoding="utf-8") as f:
                disease_knowledge_base = json.load(f)
            print(f"Loaded medical knowledge base for {len(disease_knowledge_base)} conditions.")
        except Exception as e:
            print(f"Error loading disease knowledge base: {e}")

load_knowledge_base()

def get_configured_model_type() -> str:
    """Retrieves and validates MODEL_TYPE from environment, defaulting to baseline_20class."""
    configured = os.getenv("MODEL_TYPE", "baseline_20class").strip().lower()
    if configured not in MODEL_CONFIGS:
        valid_options = list(MODEL_CONFIGS.keys())
        raise ValueError(
            f"Invalid MODEL_TYPE '{configured}'. Supported values are: {valid_options}. "
            "Please check your backend environment configuration."
        )
    return configured

def load_configured_model():
    """
    Explicitly loads the model configured by MODEL_TYPE.
    Fails immediately if model binary or class mapping is missing.
    Never silently falls back to another model.
    Never uses mock predictions.
    """
    global model, class_mapping, active_model_type, active_model_name
    
    target_type = get_configured_model_type()
    config = MODEL_CONFIGS[target_type]
    model_path = config["model_path"]
    mapping_path = config["mapping_path"]
    display_name = config["display_name"]
    expected_classes = config["expected_classes"]

    if not REAL_MODEL_SUPPORT:
        raise RuntimeError(
            "TensorFlow is not available in the current environment. "
            "Model inference requires TensorFlow."
        )

    # 1. Verify model weights file exists
    if not model_path.exists():
        raise RuntimeError(
            f"Configured model weights file not found: {model_path}. "
            f"MODEL_TYPE is '{target_type}'. "
            "Automatic fallback to other models is strictly prohibited. "
            "Ensure the model file is uploaded or downloaded to saved_models/ before starting."
        )

    # 2. Verify class mapping file exists
    if not mapping_path.exists():
        raise RuntimeError(
            f"Configured class mapping file not found: {mapping_path}. "
            f"MODEL_TYPE is '{target_type}'."
        )

    # 3. Load class mapping JSON
    try:
        with open(mapping_path, "r", encoding="utf-8") as f:
            indices = json.load(f)
            mapping = {int(v): k for k, v in indices.items()}
    except Exception as e:
        raise RuntimeError(f"Failed to parse class mapping JSON at {mapping_path}: {e}")

    if len(mapping) != expected_classes:
        raise RuntimeError(
            f"Class mapping mismatch: Expected {expected_classes} classes for '{target_type}', "
            f"but found {len(mapping)} in {mapping_path}."
        )

    # 4. Load Keras model weights
    try:
        print(f"Loading {display_name} weights from {model_path}...")
        loaded_model = tf.keras.models.load_model(str(model_path))
    except Exception as e:
        raise RuntimeError(f"Failed to load Keras model from {model_path}: {e}")

    # 5. Verify output dimensions match mapping
    output_shape = loaded_model.output_shape
    output_classes = output_shape[-1] if isinstance(output_shape, tuple) else output_shape[0][-1]
    if output_classes != len(mapping):
        raise RuntimeError(
            f"Model output dimension mismatch: Model produces {output_classes} outputs, "
            f"but class mapping contains {len(mapping)} classes."
        )

    # Commit loaded state
    model = loaded_model
    class_mapping = mapping
    active_model_type = target_type
    active_model_name = display_name

    print(f"Successfully loaded {active_model_name} with {len(class_mapping)} classes.")
    return True

# Load on module initialization
try:
    load_configured_model()
except Exception as init_err:
    print(f"WARNING during inference module initialization: {init_err}")

def get_model_status():
    """Returns current model status for healthcheck endpoints and diagnostic logging."""
    return {
        "status": "ready" if model is not None else "not_loaded",
        "model_type": active_model_type,
        "model_name": active_model_name,
        "supported_classes_count": len(class_mapping) if class_mapping else 0,
        "supported_classes": list(class_mapping.values()) if class_mapping else [],
    }

def preprocess_image(image_bytes: bytes):
    """Preprocesses input image bytes using MobileNetV2 preprocess_input"""
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    
    if REAL_MODEL_SUPPORT:
        img_array = preprocess_input(img_array)
    else:
        img_array = (img_array / 127.5) - 1.0

    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def build_prediction_result(disease: str, confidence: float):
    """Builds a disease-specific prediction result using the structured knowledge base"""
    disease_key = disease.strip()
    
    info = disease_knowledge_base.get(disease_key)
    if not info:
        for k, v in disease_knowledge_base.items():
            if k.lower() in disease_key.lower() or disease_key.lower() in k.lower():
                info = v
                break

    supported_list = list(class_mapping.values()) if class_mapping else []
    disclaimer_text = (
        f"DermaAI AI-assisted screening model ({active_model_name or 'MobileNetV2'}). "
        f"Evaluates strictly among {len(supported_list)} verified conditions: {', '.join(supported_list)}. "
        "Predictions are informational only and require professional dermatologist confirmation."
    )

    if info:
        return {
            "disease_name": info.get("disease_name", disease),
            "confidence": float(confidence),
            "description": info.get("description", f"{disease} detected."),
            "symptoms": info.get("symptoms", []),
            "causes": info.get("causes", []),
            "precautions": info.get("precautions", []),
            "warning_signs": info.get("warning_signs", []),
            "doctor_advice": info.get("doctor_advice", "Please consult a dermatologist for confirmation."),
            "reference_url": info.get("reference_url", "https://www.aad.org/"),
            "disclaimer": disclaimer_text,
            "model_type": active_model_type,
            "model_name": active_model_name
        }

    return {
        "disease_name": disease_key,
        "confidence": float(confidence),
        "description": f"{disease_key} is a skin condition requiring professional dermatological evaluation.",
        "symptoms": ["Lesion texture changes", "Skin discoloration or redness", "Localized irritation"],
        "causes": ["Genetics", "Environmental exposure", "Immune response"],
        "precautions": ["Avoid picking or irritating skin", "Apply broad-spectrum SPF sunscreen", "Keep area clean and dry"],
        "warning_signs": ["Rapid growth", "Severe pain", "Bleeding or non-healing sore"],
        "doctor_advice": "Consult a certified dermatologist for clinical dermoscopy and diagnostic confirmation.",
        "disclaimer": disclaimer_text,
        "model_type": active_model_type,
        "model_name": active_model_name
    }

async def run_inference(image_bytes: bytes):
    """Main prediction entry point. Evaluates input image strictly using loaded model."""
    global model
    if model is None:
        load_configured_model()
        if model is None:
            raise RuntimeError(
                "Model inference service unavailable: Trained model weights were not found. "
                "No mock predictions permitted."
            )
            
    try:
        processed_img = preprocess_image(image_bytes)
        print(f"Running inference with active model: {active_model_name}...")
        predictions = model.predict(processed_img)
        idx = int(np.argmax(predictions[0]))
        confidence = round(float(np.max(predictions[0])) * 100, 2)
        
        if class_mapping and idx in class_mapping:
            disease = class_mapping[idx]
        else:
            raise RuntimeError(f"Predicted index {idx} not in active class mapping.")
            
        return build_prediction_result(disease, confidence)
    except Exception as e:
        print(f"Prediction failed: {e}")
        traceback.print_exc()
        raise RuntimeError(f"Model inference failed: {e}")
