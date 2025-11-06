import json

# Load the multi-OCR report
with open('outputs/multi_ocr_report_20251102_174435.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=" * 70)
print("MULTI-OCR REPORT ANALYSIS")
print("=" * 70)

# Summary
summary = data.get('summary', {})
print(f"\nSummary:")
print(f"  Total: {summary.get('total_documents', 0)}")
print(f"  Accepted: {summary.get('accepted', 0)}")
print(f"  Rejected: {summary.get('rejected', 0)}")
print(f"  Review: {summary.get('review_required', 0)}")

# Check first 3 results
print(f"\n" + "=" * 70)
print("FIRST 3 EXTRACTION RESULTS:")
print("=" * 70)

for i, result in enumerate(data['detailed_results'][:3]):
    print(f"\n[Image {i+1}] {result.get('image_path', 'Unknown')[-50:]}")
    
    ocr = result.get('ocr_extraction', {})
    print(f"  OCR Success: {ocr.get('success', False)}")
    print(f"  OCR Engine: {ocr.get('ocr_engine', 'Unknown')}")
    print(f"  OCR Confidence: {ocr.get('ocr_confidence', 0):.1f}%")
    
    extracted = ocr.get('extracted_data', {})
    print(f"  Extracted Data:")
    print(f"    - Name: {extracted.get('name', 'NULL')}")
    print(f"    - UID: {extracted.get('uid_number', 'NULL')}")
    print(f"    - DOB: {extracted.get('dob', 'NULL')}")
    print(f"    - Gender: {extracted.get('gender', 'NULL')}")
    
    # Show raw text snippet
    raw_text = extracted.get('raw_text', '')
    if raw_text:
        print(f"  Raw Text (first 200 chars):")
        print(f"    {raw_text[:200].replace(chr(10), ' ')}")

print("\n" + "=" * 70)
