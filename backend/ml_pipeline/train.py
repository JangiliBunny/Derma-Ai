import os
import sys
import json
import numpy as np
import tensorflow as tf
from pathlib import Path
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"

# Experimental 8-Class Model Output Paths (Preserves Baseline dermai_mobilenetv2.h5 intact)
MODEL_SAVE_PATH = SAVED_MODELS_DIR / "dermai_mobilenetv2_8class_exp.h5"
CLASS_INDICES_PATH = SAVED_MODELS_DIR / "class_indices_8class_exp.json"

# Verified 8 Target Classes with >= 20 images
EXPERIMENTAL_CLASSES = [
    "Basal Cell Carcinoma",
    "Contact Dermatitis",
    "Lupus",
    "Melanoma",
    "Psoriasis",
    "Urticaria",
    "Vascular Lesion",
    "Vitiligo"
]

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS_PHASE1 = 15
EPOCHS_PHASE2 = 10

def build_model(num_classes):
    print(f"Building MobileNetV2 architecture for {num_classes} active target classes...")
    base_model = MobileNetV2(
        weights='imagenet', 
        include_top=False, 
        input_shape=IMG_SIZE + (3,)
    )

    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model, base_model

def create_data_generators(dataset_dir, target_classes):
    train_dir = dataset_dir / "train"
    val_dir = dataset_dir / "val"
    
    # Training-only Data Augmentation
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        zoom_range=0.15,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    # Validation: Preprocessing only (NO augmentation)
    val_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input
    )

    try:
        train_generator = train_datagen.flow_from_directory(
            str(train_dir),
            classes=target_classes,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=True,
            seed=42
        )

        val_generator = val_datagen.flow_from_directory(
            str(val_dir),
            classes=target_classes,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=False
        )
        return train_generator, val_generator
    except Exception as e:
        print(f"Error creating data generators: {e}")
        return None, None

def train_model():
    SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    print("Initializing MobileNetV2 8-Class Experimental Training Pipeline...")
    print(f"Target Classes ({len(EXPERIMENTAL_CLASSES)}): {EXPERIMENTAL_CLASSES}")
    
    train_gen, val_gen = create_data_generators(DATASET_DIR, EXPERIMENTAL_CLASSES)
    
    if not train_gen or train_gen.samples == 0:
        print("Cannot train model: No dataset image files found in dataset/train.")
        return

    num_classes = len(train_gen.class_indices)
    print(f"\nTraining set images:   {train_gen.samples}")
    print(f"Validation set images: {val_gen.samples}")
    print(f"Class indices mapping: {train_gen.class_indices}")
    
    # Save experimental class indices mapping separately
    with open(CLASS_INDICES_PATH, 'w', encoding="utf-8") as f:
        json.dump(train_gen.class_indices, f, indent=2)
    print(f"Saved experimental class index mapping to {CLASS_INDICES_PATH}")

    # Compute balanced class weights for imbalanced datasets
    classes = train_gen.classes
    unique_classes = np.unique(classes)
    class_weights = compute_class_weight('balanced', classes=unique_classes, y=classes)
    class_weight_dict = dict(enumerate(class_weights))
    print(f"Balanced Class Weights: {class_weight_dict}")

    model, base_model = build_model(num_classes=num_classes)
    
    checkpoint = ModelCheckpoint(
        str(MODEL_SAVE_PATH), 
        monitor='val_loss', 
        save_best_only=True, 
        verbose=1
    )
    early_stop = EarlyStopping(
        monitor='val_loss', 
        patience=5, 
        restore_best_weights=True,
        verbose=1
    )
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss', 
        factor=0.2, 
        patience=3, 
        min_lr=1e-6,
        verbose=1
    )

    print("\n=========================================================")
    print("   PHASE 1: Training Top Classifier Head (Base Frozen)   ")
    print("=========================================================")
    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS_PHASE1,
        class_weight=class_weight_dict,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )
    
    print("\n=========================================================")
    print("   PHASE 2: Fine-Tuning Base MobileNetV2 Layers          ")
    print("=========================================================")
    base_model.trainable = True
    fine_tune_at = 100
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False
        
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS_PHASE2,
        class_weight=class_weight_dict,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )
    
    print("\n=========================================================")
    print(f"TRAINING COMPLETE. Best model saved to: {MODEL_SAVE_PATH}")
    print(f"Class mapping saved to:                {CLASS_INDICES_PATH}")
    print("=========================================================")

if __name__ == "__main__":
    train_model()
