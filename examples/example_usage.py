"""
Example usage script for the Aadhaar Fraud Management System (Milestone 2)

This script demonstrates how to use the various components of the system:
1. Generate synthetic Aadhaar data
2. Validate UID numbers
3. Extract data from images using OCR
4. Verify documents through the complete pipeline
5. Generate verification reports
"""

import json
from pathlib import Path
from src.verhoeff_validator import VerhoeffValidator
from src.synthetic_data_generator import SyntheticAadhaarGenerator
from src.ocr_extractor import OcrExtractor
from src.verification_pipeline import AadhaarVerificationPipeline
from config import DATA_DIR, OUTPUTS_DIR, PROCESSED_DATA_DIR


def example_1_generate_synthetic_data():
    """Example 1: Generate synthetic Aadhaar dataset"""
    print("\n" + "="*60)
    print("Example 1: Generate Synthetic Aadhaar Dataset")
    print("="*60)
    
    generator = SyntheticAadhaarGenerator()
    
    dataset = generator.generate_dataset(
        num_valid=80,
        num_invalid=15,
        num_duplicates=5
    )
    
    print(f"\nGenerated {len(dataset)} synthetic Aadhaar records")
    print(f"Valid UIDs: {sum(1 for r in dataset if not r['is_flagged'])}")
    print(f"Flagged UIDs: {sum(1 for r in dataset if r['is_flagged'])}")
    
    json_output = generator.save_dataset(
        dataset,
        str(PROCESSED_DATA_DIR / "synthetic_aadhaar_data.json")
    )
    print(f"\nDataset saved to: {json_output}")
    
    csv_output, count = generator.generate_csv_dataset(
        num_valid=80,
        num_invalid=15,
        num_duplicates=5,
        output_path=str(PROCESSED_DATA_DIR / "synthetic_aadhaar_data.csv")
    )
    print(f"CSV dataset saved to: {csv_output} ({count} records)")
    
    print("\nSample record:")
    sample = dataset[0]
    print(json.dumps(sample, indent=2))
    
    return dataset


def example_2_validate_uid_numbers():
    """Example 2: Validate UID numbers using Verhoeff algorithm"""
    print("\n" + "="*60)
    print("Example 2: Validate UID Numbers")
    print("="*60)
    
    validator = VerhoeffValidator()
    
    test_cases = [
        ("999999999998", "Valid UID"),
        ("123456789012", "Random UID"),
        ("999999999997", "Another valid UID"),
        ("111111111111", "All ones"),
        ("12345678901", "Short UID (11 digits)"),
        ("1234567890123", "Long UID (13 digits)"),
    ]
    
    print("\nTesting UID validation:")
    print(f"{'UID':<15} {'Result':<10} {'Status':<20}")
    print("-" * 45)
    
    for uid, description in test_cases:
        try:
            result = validator.validate_aadhaar_uid(uid)
            status = "✓ Valid" if result['is_valid'] else "✗ Invalid"
            error = result['error'] if result['error'] else "No error"
            print(f"{uid:<15} {status:<10} {error:<20}")
        except ValueError as e:
            print(f"{uid:<15} {'ERROR':<10} {str(e):<20}")
    
    print("\nVerhoeff Checksum Details:")
    validator_test = VerhoeffValidator()
    
    uid_without_check = "99999999999"
    check_digit = validator_test.calculate_checksum(uid_without_check)
    valid_uid = uid_without_check + str(check_digit)
    
    print(f"Base UID (11 digits): {uid_without_check}")
    print(f"Calculated checksum: {check_digit}")
    print(f"Complete UID (12 digits): {valid_uid}")
    
    result = validator_test.validate_aadhaar_uid(valid_uid)
    print(f"Validation result: {result['is_valid']}")


def example_3_ocr_extraction():
    """Example 3: Extract data from Aadhaar images using OCR"""
    print("\n" + "="*60)
    print("Example 3: OCR Extraction (Mock Example)")
    print("="*60)
    
    extractor = OcrExtractor()
    
    print("\nOCR Extractor Capabilities:")
    print("- Image preprocessing (noise reduction, binarization)")
    print("- Text extraction using Tesseract")
    print("- Field extraction (Name, DOB, Gender, UID, Father's Name)")
    print("- Confidence scoring")
    print("- Batch processing support")
    
    print("\nField patterns recognized:")
    print(f"- UID pattern: {extractor.uid_pattern}")
    print(f"- DOB pattern: {extractor.dob_pattern}")
    print(f"- Gender pattern: {extractor.gender_pattern}")
    
    print("\nNote: To use OCR extraction on actual images:")
    print("  1. Place Aadhaar images in: data/raw/")
    print("  2. Call: result = extractor.extract_data_from_image('path/to/image.jpg')")
    print("  3. Check result['success'] and result['extracted_data']")


def example_4_verification_pipeline():
    """Example 4: Complete verification pipeline"""
    print("\n" + "="*60)
    print("Example 4: Verification Pipeline (Synthetic Data)")
    print("="*60)
    
    pipeline = AadhaarVerificationPipeline(
        use_azure_di=False,
        use_azure_openai=False
    )
    
    generator = SyntheticAadhaarGenerator()
    
    test_cases = [
        ("Valid UID", True, False),
        ("Invalid checksum", False, False),
    ]
    
    results = []
    
    for description, is_valid, _ in test_cases:
        if is_valid:
            uid = generator.generate_valid_uid()
        else:
            uid = generator.generate_invalid_uid()
        
        uid_validation = pipeline.validator.validate_aadhaar_uid(uid)
        
        result = {
            'test_case': description,
            'uid': uid,
            'validation': uid_validation,
            'recommendation': 'ACCEPT' if uid_validation['is_valid'] else 'REJECT'
        }
        results.append(result)
        
        print(f"\nTest: {description}")
        print(f"UID: {uid}")
        print(f"Valid: {uid_validation['is_valid']}")
        print(f"Error: {uid_validation['error']}")
        print(f"Recommendation: {result['recommendation']}")
    
    print("\nPipeline Features:")
    print("- Multi-layer fraud detection")
    print("- Invalid checksum detection (40 points)")
    print("- Duplicate UID detection (30 points)")
    print("- OCR confidence validation")
    print("- Azure AI integration (optional)")
    print("- Comprehensive fraud scoring (0-100)")
    print("- Report generation")


def example_5_batch_processing():
    """Example 5: Batch processing and reporting"""
    print("\n" + "="*60)
    print("Example 5: Batch Processing & Report Generation")
    print("="*60)
    
    print("\nBatch Processing Capabilities:")
    print("- Process multiple images from a directory")
    print("- Parallel processing support")
    print("- Progress tracking")
    print("- Comprehensive reporting")
    
    print("\nReport Contents:")
    print("- Summary statistics (total, accepted, rejected, review needed)")
    print("- Detailed verification results per document")
    print("- Fraud alerts and flags")
    print("- Timestamped records")
    
    print("\nTo process images in batch:")
    print("  1. Place images in: data/raw/")
    print("  2. Initialize pipeline: pipeline = AadhaarVerificationPipeline()")
    print("  3. Process: results = pipeline.batch_verify('data/raw/')")
    print("  4. Generate report: pipeline.generate_report(results, 'outputs/report.json')")


def example_6_fraud_detection_rules():
    """Example 6: Fraud detection rules and scoring"""
    print("\n" + "="*60)
    print("Example 6: Fraud Detection Rules & Scoring")
    print("="*60)
    
    print("\nFraud Detection Rules:")
    print("\n1. Invalid Checksum Detection (40 points)")
    print("   - Validates UID using Verhoeff algorithm")
    print("   - Flags invalid checksums immediately")
    
    print("\n2. Duplicate UID Detection (30 points)")
    print("   - Tracks all processed UIDs")
    print("   - Flags duplicate occurrences")
    
    print("\n3. UID Not Found (25 points)")
    print("   - Flags when UID cannot be extracted")
    print("   - Indicates OCR failure or missing UID")
    
    print("\n4. Low OCR Confidence (up to 10 points)")
    print("   - Confidence < 50% adds penalty")
    print("   - Indicates poor image quality")
    
    print("\n5. Azure Validation Failed (20 points)")
    print("   - When Azure Document Intelligence fails")
    print("   - Indicates extraction inconsistency")
    
    print("\nFraud Score Thresholds:")
    print("- 0-30 points: ACCEPT (Low risk)")
    print("- 30-50 points: REVIEW (Medium risk - requires manual inspection)")
    print("- 50+ points: REJECT (High risk - likely fraudulent)")


def example_7_configuration():
    """Example 7: System configuration"""
    print("\n" + "="*60)
    print("Example 7: System Configuration")
    print("="*60)
    
    from config import (
        BASE_DIR, DATA_DIR, OUTPUTS_DIR, PROCESSED_DATA_DIR,
        TESSERACT_PATH, FRAUD_DETECTION_CONFIG, APP_NAME, APP_VERSION, MILESTONE
    )
    
    print(f"\nApplication: {APP_NAME} v{APP_VERSION}")
    print(f"Current Milestone: {MILESTONE}")
    
    print(f"\nDirectory Configuration:")
    print(f"- Base directory: {BASE_DIR}")
    print(f"- Data directory: {DATA_DIR}")
    print(f"- Output directory: {OUTPUTS_DIR}")
    print(f"- Processed data: {PROCESSED_DATA_DIR}")
    
    print(f"\nTesseract Configuration:")
    print(f"- Path: {TESSERACT_PATH}")
    
    print(f"\nFraud Detection Scores:")
    for key, value in FRAUD_DETECTION_CONFIG.items():
        print(f"- {key}: {value}")


def main():
    """Run all examples"""
    print("\n" + "="*60)
    print("AADHAAR FRAUD MANAGEMENT SYSTEM - MILESTONE 2")
    print("AI-OCR and Document Verification")
    print("="*60)
    
    examples = [
        example_1_generate_synthetic_data,
        example_2_validate_uid_numbers,
        example_3_ocr_extraction,
        example_4_verification_pipeline,
        example_5_batch_processing,
        example_6_fraud_detection_rules,
        example_7_configuration,
    ]
    
    for example_func in examples:
        try:
            example_func()
        except Exception as e:
            print(f"\n✗ Error in {example_func.__name__}: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*60)
    print("Examples completed!")
    print("="*60)
    print("\nNext steps:")
    print("1. Configure Azure credentials (optional)")
    print("2. Place Aadhaar images in: data/raw/")
    print("3. Run the verification pipeline")
    print("4. Check outputs in: outputs/")
    print("\nFor more information, see README.md")


if __name__ == "__main__":
    main()
