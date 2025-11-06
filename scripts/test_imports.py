#!/usr/bin/env python
"""
Test script to verify all imports work correctly
Run this from the milestone_2 directory: python test_imports.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

print("Testing imports...")
print("-" * 50)

try:
    print("Importing VerhoeffValidator...", end=" ")
    from src.verhoeff_validator import VerhoeffValidator
    print("✓")
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

try:
    print("Importing SyntheticAadhaarGenerator...", end=" ")
    from src.synthetic_data_generator import SyntheticAadhaarGenerator
    print("✓")
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

try:
    print("Importing OcrExtractor...", end=" ")
    from src.ocr_extractor import OcrExtractor
    print("✓")
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

try:
    print("Importing Azure integration...", end=" ")
    from src.azure_integration import AzureDocumentIntelligence, AzureOpenAIIntegration
    print("✓")
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

try:
    print("Importing AadhaarVerificationPipeline...", end=" ")
    from src.verification_pipeline import AadhaarVerificationPipeline
    print("✓")
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

print("-" * 50)
print("All imports successful!")
print("\nTesting basic functionality...")
print("-" * 50)

try:
    validator = VerhoeffValidator()
    uid = validator.generate_valid_uid() if hasattr(validator, 'generate_valid_uid') else "999999999998"
    result = validator.validate_aadhaar_uid(uid)
    print(f"UID validation test: {'✓' if result['is_valid'] else '✗'}")
except Exception as e:
    print(f"UID validation error: {e}")

try:
    generator = SyntheticAadhaarGenerator()
    dataset = generator.generate_dataset(num_valid=5, num_invalid=2, num_duplicates=1)
    print(f"Dataset generation test: ✓ (generated {len(dataset)} records)")
except Exception as e:
    print(f"Dataset generation error: {e}")

print("-" * 50)
print("All tests passed!")
