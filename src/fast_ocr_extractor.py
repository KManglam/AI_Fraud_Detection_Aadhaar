"""
Fast OCR Extractor - Optimized for Speed
Uses only Tesseract with best preprocessing strategy
3x faster than multi-OCR approach
"""

import cv2
import pytesseract
import re
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

try:
    from config import TESSERACT_PATH
except ImportError:
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from config import TESSERACT_PATH

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FastOcrExtractor:
    """Optimized OCR extractor focusing on speed while maintaining accuracy"""
    
    def __init__(self):
        self.required_fields = ["name", "dob", "gender", "uid_number", "father_name"]
        self.uid_pattern = r'\d{12}'
        self.uid_spaced_pattern = r'\b(\d{4})\s+(\d{4})\s+(\d{4})\b'
        self.dob_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})'
        self.year_pattern = r'\b(19\d{2}|20\d{2})\b'
        self.gender_pattern = r'\b([MF]|Male|Female|MALE|FEMALE)\b'
        # Optimized Tesseract config for speed
        self.tesseract_config = r'--oem 3 --psm 6 -l eng'
        
        logger.info("Fast OCR Extractor initialized (Tesseract only)")

    def load_image(self, image_path: str) -> Optional[np.ndarray]:
        try:
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Failed to load image: {image_path}")
                return None
            return image
        except Exception as e:
            logger.error(f"Error loading image: {e}")
            return None

    def upscale_image(self, image: np.ndarray) -> np.ndarray:
        """Quick upscaling if needed"""
        h, w = image.shape[:2]
        if w < 800 or h < 600:
            scale = max(800 / w, 600 / h)
            new_w, new_h = int(w * scale), int(h * scale)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)  # Faster than CUBIC
        return image

    def preprocess_image_fast(self, image: np.ndarray) -> np.ndarray:
        """
        Ultra-fast preprocessing - removed slow denoising
        Uses CLAHE + adaptive thresholding only
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # CLAHE for contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Quick Gaussian blur instead of slow denoising
        blurred = cv2.GaussianBlur(enhanced, (3, 3), 0)
        
        # Adaptive thresholding
        binary = cv2.adaptiveThreshold(
            blurred, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 
            11, 2
        )
        
        return binary

    def extract_text_fast(self, image: np.ndarray) -> Tuple[str, float]:
        """Fast text extraction with confidence"""
        try:
            from PIL import Image
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            # Get confidence scores
            data = pytesseract.image_to_data(
                pil_image, 
                output_type=pytesseract.Output.DICT, 
                config=self.tesseract_config
            )
            confidences = [float(conf) for conf in data['conf'] if float(conf) > 0]
            avg_conf = np.mean(confidences) / 100.0 if confidences else 0.0
            
            # Extract text
            text = pytesseract.image_to_string(image, config=self.tesseract_config)
            
            return text, avg_conf
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return "", 0.0

    def correct_uid_ocr_errors(self, uid_str: str) -> str:
        """Fix common OCR mistakes in UID numbers"""
        corrections = {
            'O': '0', 'o': '0',
            'I': '1', 'l': '1', '|': '1',
            'S': '5', 's': '5',
            'Z': '2', 'z': '2',
            'B': '8', 'G': '6', 'D': '0'
        }
        
        corrected = ''
        for char in uid_str:
            corrected += corrections.get(char, char)
        
        return ''.join(filter(str.isdigit, corrected))

    def extract_uid(self, text: str) -> Optional[str]:
        """Extract UID with error correction"""
        # Try 4-4-4 spaced pattern first
        spaced_matches = re.findall(self.uid_spaced_pattern, text)
        if spaced_matches:
            uid = ''.join(spaced_matches[0])
            uid = self.correct_uid_ocr_errors(uid)
            if len(uid) == 12 and uid[0] not in ['0', '1']:
                return uid
        
        # Try 12 consecutive digits
        matches = re.findall(self.uid_pattern, text)
        for match in matches:
            corrected = self.correct_uid_ocr_errors(match)
            if len(corrected) == 12 and corrected[0] not in ['0', '1']:
                return corrected
        
        return None

    def extract_dob(self, text: str) -> Optional[str]:
        """Extract date of birth or year"""
        # Try standard date format
        matches = re.findall(self.dob_pattern, text)
        if matches:
            return matches[0]
        
        # Try year of birth
        year_matches = re.findall(self.year_pattern, text)
        if year_matches:
            for line in text.split('\n'):
                if 'year' in line.lower() or 'birth' in line.lower() or 'dob' in line.lower():
                    year_in_line = re.findall(self.year_pattern, line)
                    if year_in_line:
                        return year_in_line[0]
            return year_matches[0]
        
        return None

    def extract_gender(self, text: str) -> Optional[str]:
        """Extract gender"""
        matches = re.findall(self.gender_pattern, text, re.IGNORECASE)
        if matches:
            g = matches[0].upper()
            return 'M' if g in ['M', 'MALE'] else ('F' if g in ['F', 'FEMALE'] else None)
        return None

    def extract_name_from_lines(self, lines: List[str]) -> Optional[str]:
        """Extract name with improved logic"""
        candidates = []
        
        # Look for name after keywords
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in ['government', 'india', 'aadhaar']):
                # Check next few lines
                for j in range(i+1, min(i+5, len(lines))):
                    candidate = lines[j].strip()
                    
                    # Extract capitalized name pattern
                    name_match = re.search(r'[/()\[\]]*\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})', candidate)
                    if name_match:
                        extracted_name = name_match.group(1).strip()
                        if 2 <= len(extracted_name.split()) <= 4 and 5 <= len(extracted_name) <= 50:
                            return extracted_name
                    
                    # Standard check
                    words = candidate.split()
                    if candidate and 2 <= len(words) <= 4 and 5 <= len(candidate) <= 50:
                        if re.match(r'^[A-Za-z\s]+$', candidate):
                            if any(word[0].isupper() for word in words if word):
                                return candidate
                            candidates.append(candidate)
        
        if candidates:
            return candidates[0]
        
        # Fallback: find any capitalized name
        for line in lines:
            name_match = re.search(r'[/()\[\]]*\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})', line)
            if name_match:
                extracted_name = name_match.group(1).strip()
                if 2 <= len(extracted_name.split()) <= 4 and 5 <= len(extracted_name) <= 50:
                    return extracted_name
        
        return None

    def extract_data_from_image(self, image_path: str) -> Dict:
        """
        Fast extraction - single preprocessing pass
        """
        image = self.load_image(image_path)
        if image is None:
            return {
                'success': False,
                'error': 'Failed to load image',
                'extracted_data': None,
                'confidence': 0.0,
                'ocr_engine': 'None'
            }

        # Quick preprocessing
        image = self.upscale_image(image)
        processed = self.preprocess_image_fast(image)
        
        # Single OCR pass
        text, conf = self.extract_text_fast(processed)
        
        # Extract fields
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        data = {
            'raw_text': text,
            'name': self.extract_name_from_lines(lines),
            'dob': self.extract_dob(text),
            'gender': self.extract_gender(text),
            'uid_number': self.extract_uid(text),
            'father_name': None
        }

        # Extract father's name
        for line in lines:
            if 'father' in line.lower() or 's/o' in line.lower() or 'd/o' in line.lower():
                m = re.search(r'[:\-]?\s*([A-Za-z\s]{3,50})', line)
                if m:
                    fn = m.group(1).strip()
                    if len(fn) > 2 and not any(c.isdigit() for c in fn):
                        data['father_name'] = fn
                        break

        # Calculate confidence
        filled = sum(1 for f in self.required_fields if data.get(f))
        conf_score = (filled / len(self.required_fields)) * 100

        return {
            'success': True,
            'extracted_data': data,
            'confidence': conf_score,
            'ocr_confidence': conf * 100,
            'ocr_engine': 'Tesseract',
            'error': None
        }

    def batch_extract(self, image_directory: str) -> List[Dict]:
        """Batch process images"""
        image_dir = Path(image_directory)
        if not image_dir.exists():
            logger.error(f"Directory not found: {image_directory}")
            return []

        results = []
        exts = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        for img_file in sorted(image_dir.iterdir()):
            if img_file.suffix.lower() in exts:
                logger.info(f"Processing: {img_file.name}")
                res = self.extract_data_from_image(str(img_file))
                res['image_file'] = img_file.name
                results.append(res)
        return results
