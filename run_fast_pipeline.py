"""
Fast Aadhaar Verification Pipeline
Optimized for speed - 3x faster than multi-OCR
Uses single best preprocessing strategy
"""

import sys
from pathlib import Path
from datetime import datetime
import time
sys.path.insert(0, str(Path(__file__).parent))

from src.verification_pipeline import AadhaarVerificationPipeline
from src.fast_ocr_extractor import FastOcrExtractor
from config import RAW_DATA_DIR, OUTPUTS_DIR

print("=" * 70)
print("AADHAAR VERIFICATION PIPELINE - FAST MODE")
print("=" * 70)
print("\nOptimized for speed:")
print("  - Single preprocessing strategy")
print("  - Tesseract only (fastest OCR)")
print("  - No unnecessary deskewing")
print("  - Expected: 2-3 seconds per image")
print("=" * 70)

# Initialize Fast OCR Extractor
fast_ocr = FastOcrExtractor()

# Create pipeline with fast OCR extractor
pipeline = AadhaarVerificationPipeline()
pipeline.ocr_extractor = fast_ocr  # Replace with fast extractor

print(f"\nProcessing images from: {RAW_DATA_DIR}")
print("=" * 70)

# Start timer
start_time = time.time()

# Run verification
results = pipeline.batch_verify(str(RAW_DATA_DIR), use_azure=False)

# Calculate time
elapsed_time = time.time() - start_time

if results:
    # Generate timestamped filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = f"fast_report_{timestamp}.json"
    report_path = pipeline.generate_report(results, str(OUTPUTS_DIR / report_filename))
    
    print("\n" + "=" * 70)
    print("VERIFICATION COMPLETE")
    print("=" * 70)
    print(f"Report generated: {report_path}")
    print(f"Total images processed: {len(results)}")
    print(f"Total time: {elapsed_time:.2f} seconds")
    print(f"Average time per image: {elapsed_time/len(results):.2f} seconds")
    
    # Print summary statistics
    accepted = sum(1 for r in results if r['recommendation'] == 'ACCEPT')
    rejected = sum(1 for r in results if r['recommendation'] == 'REJECT')
    review = sum(1 for r in results if r['recommendation'] == 'REVIEW')
    
    print(f"\nResults Summary:")
    print(f"  [OK] Accepted: {accepted}")
    print(f"  [X] Rejected: {rejected}")
    print(f"  [!] Review Required: {review}")
    
    # Show extraction success rate
    total_fields = len(results) * 4  # name, uid, dob, gender
    extracted_fields = 0
    for r in results:
        data = r.get('ocr_extraction', {}).get('extracted_data', {})
        extracted_fields += sum(1 for field in ['name', 'uid_number', 'dob', 'gender'] 
                               if data.get(field))
    
    extraction_rate = (extracted_fields / total_fields) * 100 if total_fields > 0 else 0
    print(f"\nExtraction Success Rate: {extraction_rate:.1f}%")
    print(f"  Fields extracted: {extracted_fields}/{total_fields}")
    
    print("=" * 70)
else:
    print("\n[X] No images found or processed")
