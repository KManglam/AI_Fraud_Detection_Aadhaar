"""
Compare all pipeline results
"""
import json
from pathlib import Path

print("=" * 80)
print("PIPELINE COMPARISON - All Results")
print("=" * 80)

# Find all reports
reports = {
    'Multi-OCR': list(Path('outputs').glob('multi_ocr_report_*.json')),
    'Fast': list(Path('outputs').glob('fast_report_*.json')),
}

print("\n[AVAILABLE REPORTS]")
for pipeline, files in reports.items():
    print(f"\n{pipeline} Pipeline:")
    for f in sorted(files)[-3:]:  # Show last 3
        print(f"  - {f.name}")

# Load latest of each
results = {}
for pipeline, files in reports.items():
    if files:
        latest = sorted(files)[-1]
        with open(latest, 'r', encoding='utf-8') as f:
            results[pipeline] = json.load(f)
        print(f"\nLoaded: {pipeline} - {latest.name}")

if not results:
    print("\n[ERROR] No reports found!")
    exit(1)

# Compare
print("\n" + "=" * 80)
print("[COMPARISON]")
print("=" * 80)

print(f"\n{'Metric':<30} {'Multi-OCR':<15} {'Fast':<15}")
print("-" * 60)

for pipeline, data in results.items():
    summary = data.get('summary', {})
    total = summary.get('total_documents', 0)
    accepted = summary.get('accepted', 0)
    rejected = summary.get('rejected', 0)
    
    print(f"{'Total Documents':<30} {total:<15}")
    print(f"{'Accepted':<30} {accepted:<15} ({accepted/total*100:.1f}%)" if total > 0 else "")
    print(f"{'Rejected':<30} {rejected:<15} ({rejected/total*100:.1f}%)" if total > 0 else "")
    
    # Calculate extraction rate
    total_fields = 0
    extracted_fields = 0
    for result in data['detailed_results']:
        extracted_data = result.get('ocr_extraction', {}).get('extracted_data', {})
        for field in ['name', 'uid_number', 'dob', 'gender']:
            total_fields += 1
            if extracted_data.get(field):
                extracted_fields += 1
    
    extraction_rate = (extracted_fields / total_fields * 100) if total_fields > 0 else 0
    print(f"{'Extraction Rate':<30} {extraction_rate:.1f}%")
    print()

print("=" * 80)
print("[RECOMMENDATION]")
print("=" * 80)
print("\nBased on results:")
print("  1. Image quality is the main issue")
print("  2. Install EasyOCR + PaddleOCR for better accuracy")
print("  3. Or use Azure AI for production")
print("\nCommands:")
print("  pip install easyocr")
print("  pip install paddleocr paddlepaddle")
print("=" * 80)
