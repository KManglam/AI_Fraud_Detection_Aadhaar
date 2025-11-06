# Aadhaar Verification System

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

An intelligent OCR-based system for extracting and validating data from Aadhaar cards (Indian national ID) with fraud detection capabilities.

## 🌟 Features

- **Multi-OCR Support**: Integrates Tesseract, EasyOCR, and PaddleOCR for maximum accuracy
- **Smart Extraction**: Extracts Name, UID, DOB, Gender, and Father's Name
- **UID Validation**: Verhoeff checksum algorithm for UID verification
- **Fraud Detection**: Duplicate detection, checksum validation, confidence scoring
- **Azure AI Integration**: Optional cloud-based OCR for 90%+ accuracy
- **Fast Mode**: Optimized pipeline for speed (2-3s per image)
- **Batch Processing**: Process multiple images efficiently
- **Detailed Reports**: JSON reports with extraction confidence and fraud scores

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- Tesseract OCR installed
- (Optional) GPU for faster processing

### Step 1: Install Tesseract

**Windows:**
```bash
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Install to: C:\Program Files\Tesseract-OCR\
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

**macOS:**
```bash
brew install tesseract
```

### Step 2: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/aadhaar-verification.git
cd aadhaar-verification
```

### Step 3: Create Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### Step 4: Install Dependencies

```bash
# Basic installation (Tesseract only)
pip install -r requirements.txt

# Full installation (all OCR engines)
pip install -r requirements.txt
pip install easyocr
pip install paddleocr paddlepaddle
```

### Step 5: Configure

```bash
# Copy example config
cp config.example.py config.py

# Edit config.py with your settings
# - Set TESSERACT_PATH
# - Set data directories
# - (Optional) Add Azure credentials
```

## ⚡ Quick Start

### Basic Usage

```python
from src.verification_pipeline import AadhaarVerificationPipeline

# Initialize pipeline
pipeline = AadhaarVerificationPipeline()

# Process single image
result = pipeline.verify_document("path/to/aadhaar.jpg")

# Process batch
results = pipeline.batch_verify("path/to/images/")

# Generate report
pipeline.generate_report(results, "output/report.json")
```

### Command Line

```bash
# Fast mode (Tesseract only, ~2-3s per image)
python run_fast_pipeline.py

# Multi-OCR mode (Best accuracy, ~6-8s per image)
python run_multi_ocr_pipeline.py

# With Azure AI (Production quality, ~8-10s per image)
python run_pipeline.py --use-azure
```

## 📖 Usage

### 1. Fast Pipeline (Recommended for Testing)

```bash
python run_fast_pipeline.py
```

**Features:**
- Single OCR engine (Tesseract)
- Optimized preprocessing
- 2-3 seconds per image
- 60-70% accuracy

### 2. Multi-OCR Pipeline (Recommended for Production)

```bash
python run_multi_ocr_pipeline.py
```

**Features:**
- 3 OCR engines (Tesseract + EasyOCR + PaddleOCR)
- Confidence-based selection
- 6-8 seconds per image
- 70-85% accuracy

### 3. Azure AI Pipeline (Best Accuracy)

```bash
# Set Azure credentials in config.py
python run_pipeline.py --use-azure
```

**Features:**
- Cloud-based OCR
- 8-10 seconds per image
- 90%+ accuracy
- Costs ~$0.0015 per image

## 🏗️ Architecture

```
aadhaar-verification/
├── src/
│   ├── ocr_extractor.py          # Original OCR extractor
│   ├── multi_ocr_extractor.py    # Multi-OCR with 3 engines
│   ├── fast_ocr_extractor.py     # Optimized for speed
│   ├── verification_pipeline.py  # Main pipeline orchestrator
│   ├── verhoeff_validator.py     # UID checksum validation
│   └── azure_ocr.py              # Azure Document Intelligence
├── data/
│   └── raw/                      # Input images
├── outputs/                      # Generated reports
├── tests/                        # Unit tests
├── docs/                         # Additional documentation
├── config.py                     # Configuration
├── requirements.txt              # Dependencies
└── README.md                     # This file
```

### Key Components

1. **OCR Extractors**: Multiple strategies for text extraction
2. **Verification Pipeline**: Orchestrates extraction, validation, fraud detection
3. **UID Validator**: Verhoeff algorithm for Aadhaar number validation
4. **Azure Integration**: Optional cloud OCR for best accuracy

## ⚙️ Configuration

Edit `config.py`:

```python
# Tesseract path
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Data directories
RAW_DATA_DIR = Path(__file__).parent / "data" / "raw"
OUTPUTS_DIR = Path(__file__).parent / "outputs"

# Azure credentials (optional)
AZURE_ENDPOINT = "your-endpoint"
AZURE_KEY = "your-key"

# Processing options
USE_MULTI_OCR = True
ENABLE_FRAUD_DETECTION = True
```

## 📊 Performance

### Accuracy Comparison

| Pipeline | Speed | Accuracy | Use Case |
|----------|-------|----------|----------|
| **Fast** | 2-3s | 60-70% | Testing, Development |
| **Multi-OCR** | 6-8s | 70-85% | Production |
| **Azure AI** | 8-10s | 90%+ | High-accuracy needs |

### Extraction Rates

| Field | Fast | Multi-OCR | Azure AI |
|-------|------|-----------|----------|
| **Name** | 70% | 85% | 95% |
| **UID** | 60% | 75% | 90% |
| **DOB** | 65% | 70% | 85% |
| **Gender** | 50% | 60% | 80% |

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Run specific test
pytest tests/test_verhoeff_validator.py -v
```

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Multi-OCR Setup](MULTI_OCR_IMPLEMENTATION_GUIDE.md)
- [Performance Tuning](docs/PERFORMANCE.md)
- [API Reference](docs/API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run linters
black src/ tests/
flake8 src/ tests/

# Run tests
pytest tests/ -v
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Tesseract OCR team
- EasyOCR contributors
- PaddleOCR developers
- Microsoft Azure AI team

## 📧 Contact

For questions or support, please open an issue on GitHub.

## ⚠️ Disclaimer

This system is for educational and research purposes. Ensure compliance with local data protection laws when processing Aadhaar cards or any personal identification documents.

---

**Made with ❤️ for secure document verification**
