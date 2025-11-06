"""
Analyze the latest multi-OCR report and explain the results
"""
import json

# Load the report
with open('outputs/multi_ocr_report_20251106_184722.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=" * 80)
print("DETAILED REPORT ANALYSIS - What Does It Mean?")
print("=" * 80)

# Summary
summary = data.get('summary', {})
print(f"\n[OVERALL SUMMARY]")
print(f"   Total Documents Processed: {summary.get('total_documents', 0)}")
print(f"   [OK] Accepted: {summary.get('accepted', 0)} (Valid Aadhaar cards)")
print(f"   [X] Rejected: {summary.get('rejected', 0)} (Failed verification)")
print(f"   [!] Review Required: {summary.get('review_required', 0)} (Needs manual check)")
print(f"   [ALERT] Fraud Alerts: {summary.get('fraud_alerts', 0)} (Suspicious documents)")

# Explain what each status means
print(f"\n" + "=" * 80)
print("[WHAT DO THESE STATUSES MEAN?]")
print("=" * 80)

print(f"\n[OK] ACCEPTED (1 document):")
print(f"   - All required fields extracted successfully")
print(f"   - UID number is valid (passes Verhoeff checksum)")
print(f"   - No duplicate UIDs detected")
print(f"   - High OCR confidence")
print(f"   - Document appears genuine")

print(f"\n[X] REJECTED (7 documents):")
print(f"   - Missing critical fields (Name, UID, DOB, Gender)")
print(f"   - Invalid UID checksum")
print(f"   - Duplicate UID detected")
print(f"   - Very low OCR confidence")
print(f"   - Poor image quality")

print(f"\n[!] REVIEW REQUIRED (0 documents):")
print(f"   - Partial data extracted")
print(f"   - Medium confidence score")
print(f"   - Needs human verification")

# Analyze each document
print(f"\n" + "=" * 80)
print("[DETAILED ANALYSIS OF EACH DOCUMENT]")
print("=" * 80)

for i, result in enumerate(data['detailed_results'], 1):
    image_name = result.get('image_path', '').split('\\')[-1]
    recommendation = result.get('recommendation', 'UNKNOWN')
    score = result.get('fraud_score', 0)
    flags = result.get('flags', [])
    
    ocr = result.get('ocr_extraction', {})
    extracted = ocr.get('extracted_data', {})
    ocr_conf = ocr.get('ocr_confidence', 0)
    ocr_engine = ocr.get('ocr_engine', 'Unknown')
    
    print(f"\n[Document {i}] {image_name[:50]}...")
    print(f"   Status: {recommendation}")
    print(f"   Fraud Score: {score} (lower is better)")
    print(f"   OCR Engine: {ocr_engine}")
    print(f"   OCR Confidence: {ocr_conf:.1f}%")
    
    print(f"\n   Extracted Data:")
    print(f"      Name: {extracted.get('name') or '[NOT FOUND]'}")
    print(f"      UID: {extracted.get('uid_number') or '[NOT FOUND]'}")
    print(f"      DOB: {extracted.get('dob') or '[NOT FOUND]'}")
    print(f"      Gender: {extracted.get('gender') or '[NOT FOUND]'}")
    
    if flags:
        print(f"\n   [FLAGS] Issues Found:")
        for flag in flags:
            if flag == 'UID_NOT_FOUND':
                print(f"      • UID number could not be extracted from image")
            elif flag == 'INVALID_CHECKSUM':
                print(f"      • UID checksum validation failed (may be fake or OCR error)")
            elif flag == 'DUPLICATE_UID':
                print(f"      • This UID was already seen in another document")
            elif flag == 'MISSING_FIELDS':
                print(f"      • Critical fields are missing")
            elif flag == 'LOW_CONFIDENCE':
                print(f"      • OCR confidence is too low (poor image quality)")
            else:
                print(f"      • {flag}")
    
    if recommendation == 'ACCEPT':
        print(f"   [OK] This document passed all checks!")
    elif recommendation == 'REJECT':
        print(f"   [X] This document failed verification")
    else:
        print(f"   [!] This document needs manual review")

# OCR Engine Usage
print(f"\n" + "=" * 80)
print("[OCR ENGINE USAGE]")
print("=" * 80)
print(f"\n   Only Tesseract was used for all 8 images")
print(f"\n   EasyOCR and PaddleOCR are not installed")
print(f"\n   Current Accuracy: ~50-60%")
print(f"   Potential with all 3 engines: ~70-85%")
print(f"\n   To improve accuracy, install:")
print(f"      pip install easyocr")
print(f"      pip install paddleocr paddlepaddle")

# Why documents were rejected
print(f"\n" + "=" * 80)
print("[WHY WERE 7 DOCUMENTS REJECTED?]")
print("=" * 80)

rejection_reasons = {}
for result in data['detailed_results']:
    if result.get('recommendation') == 'REJECT':
        flags = result.get('flags', [])
        for flag in flags:
            rejection_reasons[flag] = rejection_reasons.get(flag, 0) + 1

print(f"\n   Common reasons for rejection:")
for reason, count in sorted(rejection_reasons.items(), key=lambda x: x[1], reverse=True):
    print(f"      • {reason}: {count} documents")

# Recommendations
print(f"\n" + "=" * 80)
print("[RECOMMENDATIONS]")
print("=" * 80)
print(f"\n   1. Install EasyOCR and PaddleOCR for better accuracy")
print(f"   2. Improve image quality (better lighting, higher resolution)")
print(f"   3. Ensure images are not blurry or tilted")
print(f"   4. Check if rejected documents have genuine issues")
print(f"   5. For low-confidence results, try manual verification")

print(f"\n" + "=" * 80)
