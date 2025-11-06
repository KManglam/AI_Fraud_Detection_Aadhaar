"""
Run Aadhaar Verification Pipeline with Multi-OCR Support
Uses Tesseract + EasyOCR + PaddleOCR for better accuracy
"""

import sys
from pathlib import Path
from datetime import datetime
sys.path.insert(0, str(Path(__file__).parent))

from src.verification_pipeline import AadhaarVerificationPipeline
from src.multi_ocr_extractor import MultiOcrExtractor
from config import RAW_DATA_DIR, OUTPUTS_DIR

print("=" * 70)
print("AADHAAR VERIFICATION PIPELINE - MULTI-OCR MODE")
print("=" * 70)

# Initialize Multi-OCR Extractor
print("\nInitializing Multi-OCR Extractor...")
print("- Tesseract OCR: Enabled")
print("- EasyOCR: Checking...")
print("- PaddleOCR: Checking...")

multi_ocr = MultiOcrExtractor(
    use_tesseract=True,
    use_easyocr=True,
    use_paddleocr=True
)

# Create pipeline with multi-OCR extractor
pipeline = AadhaarVerificationPipeline()
pipeline.ocr_extractor = multi_ocr  # Replace default OCR with multi-OCR

print(f"\nProcessing images from: {RAW_DATA_DIR}")
print("=" * 70)

# Run verification
results = pipeline.batch_verify(str(RAW_DATA_DIR), use_azure=False)

if results:
    # Generate timestamped filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = f"multi_ocr_report_{timestamp}.json"
    report_path = pipeline.generate_report(results, str(OUTPUTS_DIR / report_filename))
    
    print("\n" + "=" * 70)
    print("VERIFICATION COMPLETE")
    print("=" * 70)
    print(f"Report generated: {report_path}")
    print(f"Total images processed: {len(results)}")
    
    # Print summary statistics
    accepted = sum(1 for r in results if r['recommendation'] == 'ACCEPT')
    rejected = sum(1 for r in results if r['recommendation'] == 'REJECT')
    review = sum(1 for r in results if r['recommendation'] == 'REVIEW')
    
    print(f"\nResults Summary:")
    print(f"  ✓ Accepted: {accepted}")
    print(f"  ✗ Rejected: {rejected}")
    print(f"  ⚠ Review Required: {review}")
    
    # Count OCR engine usage
    ocr_engines = {}
    for r in results:
        engine = r.get('ocr_extraction', {}).get('ocr_engine', 'Unknown')
        ocr_engines[engine] = ocr_engines.get(engine, 0) + 1
    
    print(f"\nOCR Engine Usage:")
    for engine, count in ocr_engines.items():
        print(f"  - {engine}: {count} images")
    
    print("=" * 70)
else:
    print("\n✗ No images found or processed")
