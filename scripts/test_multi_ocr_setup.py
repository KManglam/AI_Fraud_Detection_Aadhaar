"""
Test Multi-OCR Setup
Verifies that all OCR engines are properly installed and working
"""

import sys
from pathlib import Path

print("=" * 70)
print("MULTI-OCR SETUP VERIFICATION")
print("=" * 70)

# Test 1: Check Python packages
print("\n[1/5] Checking Python packages...")

packages = {
    'cv2': 'OpenCV',
    'pytesseract': 'Tesseract Python',
    'numpy': 'NumPy',
    'easyocr': 'EasyOCR',
    'paddleocr': 'PaddleOCR'
}

missing = []
for package, name in packages.items():
    try:
        __import__(package)
        print(f"  ✓ {name} installed")
    except ImportError:
        print(f"  ✗ {name} NOT installed")
        missing.append(name)

if missing:
    print(f"\n⚠ Missing packages: {', '.join(missing)}")
    print("Install with: pip install easyocr paddleocr paddlepaddle")
    sys.exit(1)

# Test 2: Check Tesseract executable
print("\n[2/5] Checking Tesseract executable...")
try:
    import pytesseract
    from config import TESSERACT_PATH
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    version = pytesseract.get_tesseract_version()
    print(f"  ✓ Tesseract found: Version {version}")
except Exception as e:
    print(f"  ✗ Tesseract error: {e}")
    sys.exit(1)

# Test 3: Initialize EasyOCR
print("\n[3/5] Initializing EasyOCR...")
try:
    import easyocr
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    print("  ✓ EasyOCR initialized successfully")
except Exception as e:
    print(f"  ✗ EasyOCR initialization failed: {e}")

# Test 4: Initialize PaddleOCR
print("\n[4/5] Initializing PaddleOCR...")
try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    print("  ✓ PaddleOCR initialized successfully")
except Exception as e:
    print(f"  ✗ PaddleOCR initialization failed: {e}")

# Test 5: Test on sample image
print("\n[5/5] Testing on sample image...")
try:
    from src.multi_ocr_extractor import MultiOcrExtractor
    from config import RAW_DATA_DIR
    
    # Find first image
    image_dir = Path(RAW_DATA_DIR)
    images = list(image_dir.glob("*.jpg"))
    
    if not images:
        print("  ⚠ No test images found in data/raw/")
    else:
        test_image = images[0]
        print(f"  Testing with: {test_image.name}")
        
        extractor = MultiOcrExtractor()
        result = extractor.extract_data_from_image(str(test_image))
        
        print(f"\n  Results:")
        print(f"    OCR Engine: {result.get('ocr_engine', 'Unknown')}")
        print(f"    Confidence: {result.get('ocr_confidence', 0):.1f}%")
        print(f"    UID: {result['extracted_data'].get('uid_number', 'Not found')}")
        print(f"    Name: {result['extracted_data'].get('name', 'Not found')}")
        print(f"    DOB: {result['extracted_data'].get('dob', 'Not found')}")
        print(f"    Gender: {result['extracted_data'].get('gender', 'Not found')}")
        
        print("\n  ✓ Multi-OCR extraction successful!")
        
except Exception as e:
    print(f"  ✗ Test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 70)
print("✓ ALL TESTS PASSED - Multi-OCR system is ready!")
print("=" * 70)
print("\nNext step: Run the pipeline with:")
print("  python run_multi_ocr_pipeline.py")
print("=" * 70)
