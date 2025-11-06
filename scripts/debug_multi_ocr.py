"""
Debug Multi-OCR Extraction Issue
"""
import cv2
import numpy as np
from pathlib import Path

print("Testing Multi-OCR Extraction...")
print("=" * 70)

# Test 1: Check if image loads
test_image = Path("data/raw/06_01_2022_03_14_51_png_jpg.rf.066ab05c8e52e0c8eb7f8160c29a5aae.jpg")
if not test_image.exists():
    print(f"ERROR: Test image not found: {test_image}")
    # Find any image
    images = list(Path("data/raw").glob("*.jpg"))
    if images:
        test_image = images[0]
        print(f"Using alternative: {test_image.name}")
    else:
        print("No images found!")
        exit(1)

img = cv2.imread(str(test_image))
print(f"\n[1] Image loaded: {img is not None}")
if img is not None:
    print(f"    Shape: {img.shape}")
    print(f"    Size: {img.shape[1]}x{img.shape[0]}")

# Test 2: Try original OCR extractor (working one)
print(f"\n[2] Testing Original OCR Extractor...")
try:
    from src.ocr_extractor import OcrExtractor
    old_ocr = OcrExtractor()
    result_old = old_ocr.extract_data_from_image(str(test_image))
    print(f"    Success: {result_old['success']}")
    print(f"    Name: {result_old['extracted_data']['name']}")
    print(f"    UID: {result_old['extracted_data']['uid_number']}")
    print(f"    Raw text length: {len(result_old['extracted_data']['raw_text'])}")
    print(f"    Raw text preview: {result_old['extracted_data']['raw_text'][:100]}")
except Exception as e:
    print(f"    ERROR: {e}")

# Test 3: Try multi-OCR extractor
print(f"\n[3] Testing Multi-OCR Extractor...")
try:
    from src.multi_ocr_extractor import MultiOcrExtractor
    multi_ocr = MultiOcrExtractor(
        use_tesseract=True,
        use_easyocr=True,
        use_paddleocr=True
    )
    result_new = multi_ocr.extract_data_from_image(str(test_image))
    print(f"    Success: {result_new['success']}")
    print(f"    OCR Engine: {result_new.get('ocr_engine', 'Unknown')}")
    print(f"    Name: {result_new['extracted_data']['name']}")
    print(f"    UID: {result_new['extracted_data']['uid_number']}")
    print(f"    Raw text length: {len(result_new['extracted_data']['raw_text'])}")
    print(f"    Raw text preview: {result_new['extracted_data']['raw_text'][:100]}")
except Exception as e:
    print(f"    ERROR: {e}")
    import traceback
    traceback.print_exc()

# Test 4: Test individual OCR engines
print(f"\n[4] Testing Individual OCR Engines on Preprocessed Image...")

try:
    from src.multi_ocr_extractor import MultiOcrExtractor
    extractor = MultiOcrExtractor()
    
    # Load and preprocess
    image = extractor.load_image(str(test_image))
    image = extractor.upscale_image(image)
    image = extractor.deskew_image(image)
    proc_img = extractor.preprocess_image_v1(image)
    
    print(f"    Preprocessed image shape: {proc_img.shape}")
    
    # Test Tesseract
    if extractor.use_tesseract:
        text, conf = extractor.extract_text_tesseract(proc_img)
        print(f"\n    Tesseract:")
        print(f"      Confidence: {conf:.2%}")
        print(f"      Text length: {len(text)}")
        print(f"      Preview: {text[:100]}")
    
    # Test EasyOCR
    if extractor.use_easyocr:
        text, conf = extractor.extract_text_easyocr(proc_img)
        print(f"\n    EasyOCR:")
        print(f"      Confidence: {conf:.2%}")
        print(f"      Text length: {len(text)}")
        print(f"      Preview: {text[:100]}")
    
    # Test PaddleOCR
    if extractor.use_paddleocr:
        text, conf = extractor.extract_text_paddleocr(proc_img)
        print(f"\n    PaddleOCR:")
        print(f"      Confidence: {conf:.2%}")
        print(f"      Text length: {len(text)}")
        print(f"      Preview: {text[:100]}")
        
except Exception as e:
    print(f"    ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
