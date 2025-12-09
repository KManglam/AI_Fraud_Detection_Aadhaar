"""
Gemini API integration for text extraction and fraud detection
"""
import google.generativeai as genai
from django.conf import settings
import json
import re
from .verhoeff import validate_aadhaar


def normalize_bilingual_field(value):
    """
    Normalize bilingual fields that Gemini 2.5 Flash may return as objects.
    Converts {hindi: "...", english: "..."} objects to strings.
    
    Args:
        value: The field value to normalize
        
    Returns:
        str: Normalized string value
    """
    if value is None:
        return None
    
    if isinstance(value, dict):
        # If bilingual text with english key, prefer english
        if "english" in value:
            return str(value["english"]).strip()
        elif "English" in value:
            return str(value["English"]).strip()
        # If bilingual text with hindi key but no english, use hindi
        elif "hindi" in value:
            return str(value["hindi"]).strip()
        elif "Hindi" in value:
            return str(value["Hindi"]).strip()
        else:
            # Convert the whole object to JSON string
            return json.dumps(value)
    
    return str(value).strip() if value else value


class GeminiService:
    """Service class for interacting with Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini API with configuration"""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.5-flash")
    
    def extract_text_from_image(self, image_path):
        """
        Extract text and analyze Aadhaar document
        
        Args:
            image_path: Path to the image file
            
        Returns:
            dict: Extracted information including text, fields, and fraud indicators
        """
        try:
            # Read the image file
            with open(image_path, "rb") as f:
                img_bytes = f.read()
            
            # Create detailed prompt for Aadhaar analysis - supports both card and e-Aadhaar formats
            prompt = """You are an expert Aadhaar fraud detection system. Analyze this document carefully.

EXTRACT THE FOLLOWING:
1. Full text content (OCR)
2. Aadhaar Number (12 digits)
3. Name (in both Hindi and English)
4. Date of Birth
5. Gender
6. Address

**IMPORTANT: AADHAAR HAS TWO VALID FORMATS:**

**FORMAT 1 - Physical PVC Card:**
- Small plastic card format
- Orange/red bottom strip with "आधार - आम आदमी का अधिकार"
- Compact layout with photo on left, QR on right

**FORMAT 2 - e-Aadhaar Printout (Downloaded from UIDAI):**
- Letter/A4 paper format
- Has "मेरा आधार, मेरी पहचान" text
- Shows both front and back information on same page
- Has UIDAI website (www.uidai.gov.in) and helpline (1947)
- Has "Unique Identification Authority of India" text
- QR code present (may be larger)
- Print Date mentioned

**COMMON REQUIRED ELEMENTS (Both formats must have):**
1. Ashoka Emblem (Lion Capital) - official government emblem
2. "भारत सरकार" / "Government of India" text
3. Aadhaar/UIDAI logo
4. QR code (for verification)
5. Photo of the person
6. Name in Hindi AND English
7. DOB, Gender information
8. 12-digit Aadhaar number in XXXX XXXX XXXX format

**ACTUAL FRAUD INDICATORS (Check these carefully):**
- Photo appears edited, pasted, or manipulated
- Text looks digitally altered or inconsistent
- Aadhaar number format is wrong (not 12 digits)
- Missing official Ashoka Emblem completely
- Missing "भारत सरकार" / "Government of India" text
- No QR code at all
- Completely wrong layout that matches neither format
- Obvious spelling errors in official text
- Signs of physical tampering (cut marks, paste marks)
- Blurred/illegible critical information
- Mismatched fonts within the same section (sign of editing)

**THINGS THAT ARE NOT FRAUD:**
- e-Aadhaar printout format (this is OFFICIAL and VALID)
- Black and white printout (valid for e-Aadhaar)
- "मेरा आधार, मेरी पहचान" instead of orange strip (valid for e-Aadhaar)
- Paper document instead of plastic card (valid for e-Aadhaar)
- UIDAI helpline/website info present (valid for e-Aadhaar)
- Image quality issues due to camera/scanning (not fraud, just quality)

**AUTHENTICATION DECISION:**
- Mark AUTHENTIC if it matches EITHER the physical card OR e-Aadhaar format
- Mark NOT AUTHENTIC only if there are clear signs of tampering or forgery
- Image quality issues alone should NOT mark as not authentic

RESPOND IN JSON FORMAT:
{
    "full_text": "complete OCR text",
    "aadhaar_number": "12-digit number or null",
    "name": "name or null",
    "date_of_birth": "DOB or null",
    "gender": "Male/Female/Other or null",
    "address": "address or null",
    "is_authentic": true/false,
    "confidence_score": 0.0-1.0,
    "fraud_indicators": ["list ONLY actual fraud signs, not format differences"],
    "quality_issues": ["list quality problems like blur, lighting etc"],
    "document_format": "physical_card" or "e_aadhaar",
    "design_compliance": {
        "has_ashoka_emblem": true/false,
        "has_govt_text": true/false,
        "has_aadhaar_logo": true/false,
        "has_qr_code": true/false,
        "has_photo": true/false,
        "has_bilingual_name": true/false,
        "format_valid": true/false
    },
    "extracted_fields": {},
    "analysis_summary": "brief summary"
}

Respond ONLY with JSON, no additional text."""

            # Generate content with the image
            response = self.model.generate_content(
                [
                    prompt,
                    {
                        "mime_type": "image/jpeg",  # Will work for most image formats
                        "data": img_bytes
                    }
                ]
            )
            
            # Parse the response - response.text is always a string
            response_text = response.text.strip()
            
            # Try to extract JSON from the response
            # Sometimes the model includes markdown code blocks
            if "```json" in response_text:
                # Extract JSON from markdown code block
                json_start = response_text.find("```json") + 7
                json_end = response_text.rfind("```")
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                # Extract from generic code block
                json_start = response_text.find("```") + 3
                json_end = response_text.rfind("```")
                response_text = response_text[json_start:json_end].strip()
            
            # Parse JSON response
            try:
                parsed_response = json.loads(response_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, create a structured response
                parsed_response = {
                    "full_text": response_text,
                    "aadhaar_number": None,
                    "name": None,
                    "date_of_birth": None,
                    "gender": None,
                    "address": None,
                    "is_authentic": None,
                    "confidence_score": 0.5,
                    "fraud_indicators": [],
                    "quality_issues": ["Unable to parse structured response"],
                    "extracted_fields": {},
                    "analysis_summary": "Raw text extraction only"
                }
            
            # Normalize bilingual fields that Gemini 2.5 Flash may return as objects
            # This fixes the React error: "Objects are not valid as a React child"
            bilingual_fields = ['name', 'address', 'full_text', 'analysis_summary', 'date_of_birth', 'gender']
            for field in bilingual_fields:
                if field in parsed_response:
                    parsed_response[field] = normalize_bilingual_field(parsed_response[field])
            
            # Also normalize nested fields in extracted_fields if present
            if 'extracted_fields' in parsed_response and isinstance(parsed_response['extracted_fields'], dict):
                for key in parsed_response['extracted_fields']:
                    parsed_response['extracted_fields'][key] = normalize_bilingual_field(
                        parsed_response['extracted_fields'][key]
                    )
            
            # Validate Aadhaar number using step-by-step algorithm
            aadhaar_num = parsed_response.get('aadhaar_number')
            validation_error = None
            
            if aadhaar_num:
                # Clean the number first (remove spaces/hyphens)
                clean_num = str(aadhaar_num).replace(" ", "").replace("-", "")
                
                # Step 1: Check Length
                if len(clean_num) != 12:
                    validation_error = f"Invalid Aadhaar length: {len(clean_num)} digits (expected 12)"
                
                # Step 2: Check First Digit (must be 2-9)
                elif not clean_num[0] in "23456789":
                    validation_error = f"Invalid first digit: {clean_num[0]} (must be 2-9)"
                
                # Step 3: Check Number Format (Regex)
                elif not re.match(r'^[2-9][0-9]{11}$', clean_num):
                    validation_error = "Invalid Aadhaar number format (Regex mismatch)"
                
                # Step 4: Apply Verhoeff Checksum
                elif not validate_aadhaar(clean_num):
                    validation_error = "Invalid Aadhaar number (Verhoeff checksum failed)"
                
                # Apply validation result
                if validation_error:
                    parsed_response['is_authentic'] = False
                    
                    # Initialize list if None
                    if parsed_response.get('fraud_indicators') is None:
                        parsed_response['fraud_indicators'] = []
                        
                    parsed_response['fraud_indicators'].append(validation_error)
                    
                    # Update summary
                    summary = parsed_response.get('analysis_summary', '')
                    parsed_response['analysis_summary'] = f"{summary}. {validation_error}."
                    
                    # Lower confidence score if it was high
                    if parsed_response.get('confidence_score', 0) > 0.5:
                        parsed_response['confidence_score'] = 0.1

            # Add the raw response for reference
            parsed_response['raw_gemini_response'] = response.text
            
            return parsed_response
            
        except Exception as e:
            return {
                "error": str(e),
                "full_text": "",
                "aadhaar_number": None,
                "name": None,
                "date_of_birth": None,
                "gender": None,
                "address": None,
                "is_authentic": False,
                "confidence_score": 0.0,
                "fraud_indicators": [f"Processing error: {str(e)}"],
                "quality_issues": [],
                "extracted_fields": {},
                "analysis_summary": f"Error during analysis: {str(e)}"
            }
    
    def batch_analyze(self, image_paths):
        """
        Analyze multiple images in batch
        
        Args:
            image_paths: List of image file paths
            
        Returns:
            list: List of analysis results for each image
        """
        results = []
        for idx, image_path in enumerate(image_paths):
            print(f"Processing image {idx + 1}/{len(image_paths)}: {image_path}")
            result = self.extract_text_from_image(image_path)
            result['batch_position'] = idx
            results.append(result)
        
        return results
