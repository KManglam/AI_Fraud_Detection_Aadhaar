"""
Aadhaar Fraud Management System - Milestone 2
AI-OCR and Document Verification

Components:
- verhoeff_validator: UID validation using Verhoeff checksum
- synthetic_data_generator: Generate synthetic Aadhaar data
- ocr_extractor: Extract data from images using OCR
- azure_integration: Azure AI Document Intelligence integration
- verification_pipeline: Main verification orchestrator
"""

__version__ = "2.0.0"
__author__ = "Infosys Springboard Internship"
__all__ = [
    "VerhoeffValidator",
    "SyntheticAadhaarGenerator",
    "OcrExtractor",
    "AzureDocumentIntelligence",
    "AzureOpenAIIntegration",
    "AadhaarVerificationPipeline"
]
