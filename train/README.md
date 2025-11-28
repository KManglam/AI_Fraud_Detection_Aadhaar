# Aadhaar Fraud Detection Model Training

## Overview
This directory contains the training notebook for YOLO-based fraud detection models to identify:
- Document tampering
- Photo overlays
- Tampered QR codes
- Altered fonts
- Subtle modifications

## Directory Structure
```
train/
├── notebooks/
│   └── aadhaar_fraud_detection_yolo.ipynb    # Main Colab training notebook
└── README.md
```

## Training on Google Colab

### Step 1: Upload Dataset to Google Drive
1. Go to [Google Drive](https://drive.google.com)
2. Create a folder named `AadhaarAuth_Dataset`
3. Upload your `datasets` folder contents (train/, valid/, test/)

### Step 2: Open Training Notebook
1. Go to [Google Colab](https://colab.research.google.com)
2. File → Upload notebook → Select `aadhaar_fraud_detection_yolo.ipynb`

### Step 3: Enable GPU
1. Runtime → Change runtime type → GPU (T4)

### Step 4: Run Training
1. Run each cell in order
2. Mount Google Drive when prompted
3. Update `DATASET_PATH` to your Drive path
4. Training takes 1-4 hours

### Step 5: Deploy Model
1. Download `best.pt` from `MyDrive/AadhaarAuth_Models/`
2. Place in `backend/models/aadhaar_fraud_detector.pt`

## Model Classes
- **Class 0**: Aadhaar Number Region
- **Class 1**: Photo Region  
- **Class 2**: QR Code Region
- **Class 3**: Name Field
- **Class 4**: Address Field

## Training Tips
- **Better Accuracy**: Use YOLOv8m/l, train 100+ epochs
- **Faster Training**: Use YOLOv8n/s, train 50 epochs
- **Out of Memory**: Reduce batch_size to 8 or 4

## Backend Integration
After training, the model integrates automatically via `backend/documents/fraud_detector.py`
